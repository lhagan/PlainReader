#!/usr/bin/env python
"""
instapaper.py
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.txt for details)
"""

import urllib2
from BeautifulSoup import BeautifulSoup
import re

class instapaper():
    def __init__(self, url):
        self.url = url
        instapaper_url = 'http://www.instapaper.com/text?u=%s' % url
        self.soup = BeautifulSoup(urllib2.urlopen(instapaper_url).read())
    
    def story(self):
        story = self.soup.find('div',{'id':re.compile("story")})
        return story

def main():
    ip = instapaper("http://google.com")
    print ip.story()

if __name__ == "__main__":
    main()