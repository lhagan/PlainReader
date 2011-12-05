#!/usr/bin/env python
"""
serv.py (the actual webapp)
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.txt for details)
"""

from bottle import *
import newsblur_interface
import instapaper
import webbrowser
import sigintfix
from threading import Timer
from optparse import OptionParser

sigintfix.Watcher()
nb = newsblur_interface.Interface()

def openBrowser():
    webbrowser.open('http://localhost:8181')

@route('/refresh')
def refresh():
    nb.refresh();

@route('/unread')
def unread():
    return nb.stories()
    
@get('/mark_read')
def queue_read():
    story_id = request.GET['story_id']
    feed_id = request.GET['feed_id']
    nb.queueRead(story_id, feed_id)

@get('/all_read')
def mark_all_as_read():
    nb.markAllAsRead()
    
@get('/text')
def instapaper_text():
    url = request.GET['url']
    if url:
        ip = instapaper.instapaper(url)
        story = ip.story()
        return """%s""" % story
    else:
        return '<h1>URL not supplied</h1>'

@get('/login')
def login_form():
    return template('login')
@post('/login')
def login_submit():
    username = request.forms.get('username')
    password = request.forms.get('password')
    nb.login(username, password)
    redirect('/')
        
# route static files
@route('/:path#.+#')
def server_static(path):
    response.headers['Cache-Control'] = 'no-cache'
    return static_file(path, root='static/')

# index
@route('/')
def index():
    if nb.checkAuth():
        return static_file('index.html', root='static/')
    else:
        redirect('/login')
        
def main():
    parser = OptionParser(usage="%prog [options]")
    parser.add_option(  "-n", "--nobrowser", action="store_true", default=False, dest="nobrowser", help="Don't automatically open site in browser.")
    opts, args = parser.parse_args()

    if not opts.nobrowser:
        # open browser in 2 seconds
        Timer(2, openBrowser, ()).start()

    debug(True)
    run(host='0.0.0.0', port=8181, reloader=True)

if __name__ == "__main__":
    main()