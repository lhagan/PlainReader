#!/usr/bin/env python
"""
newsblur_interface.py
part of PlainReader by Luke Hagan
created: 2011-11-04
released under the MIT license (see LICENSE.txt for details)
"""

import newsblur
import threading

class Interface():
    def __init__(self, simulate_mark_as_read):
        self.nb = newsblur.API()
        self.items = {}
        self.mark_as_read_queue = {}
        self.t = threading.Timer(15, self.markAsRead)
        self.simulate_mark_as_read = simulate_mark_as_read
    
    def checkAuth(self):
        status = self.nb.login('', '')['authenticated']
        return status
    
    def login(self, username, password):
        self.nb.login(username, password)
        
    def refresh(self):
        feeds = self.nb.feeds()['feeds']
        unreadfeeds = {}
        for feed in feeds:
            if feeds[feed]['ps'] != 0 or feeds[feed]['nt'] != 0:
            #if feeds[feed]['ng'] != 0:
                unreadfeeds[feed] = feeds[feed]['feed_title']

        feed_array = []
        for feed_id in unreadfeeds:
            feed_array.append(feed_id)
        river = self.nb.river_stories(feed_array)
        allstories = river['stories']
        
        unreadstories = []
        for story in allstories:
            if story['read_status'] == 0:
                nogood = False
                for attr in story['intelligence']:
                    if int(story['intelligence'][attr]) < 0:
                        nogood = True
                if not nogood:
                    story['site_title'] = unreadfeeds['%s' % story['story_feed_id']]
                    unreadstories.append(story)
        self.items['stories'] = unreadstories
        
    def stories(self):
        return self.items
    
    def queueRead(self, story_id, feed_id):
        self.t.cancel()
        
        if not feed_id in self.mark_as_read_queue:
            self.mark_as_read_queue[feed_id] = [];
        if len(self.mark_as_read_queue[feed_id]) == 0:
            self.mark_as_read_queue[feed_id] = [];
        
        self.mark_as_read_queue[feed_id].append(story_id)
        
        # TODO: this doesn't seem to work consistently
        if len(self.mark_as_read_queue) >= 5:
            self.markAsRead
        else:
            self.t = threading.Timer(15, self.markAsRead)
            self.t.start()
    
    def markAsRead(self):
        for feed_id in self.mark_as_read_queue:
            if self.simulate_mark_as_read:
                print self.mark_as_read_queue
            else:
                self.nb.mark_story_as_read(feed_id, self.mark_as_read_queue[feed_id])
                
        self.mark_as_read_queue[feed_id] = {}
            
def main():
    newsblur = Interface()
    newsblur.refresh()
    stories = newsblur.stories()
    print stories

if __name__ == "__main__":
    main()

