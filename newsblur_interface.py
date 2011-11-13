#!/usr/bin/env python
"""
newsblur_interface.py
part of PlainReader by Luke Hagan
created: 2011-11-04
released under the MIT license (see LICENSE.txt for details)
"""

import newsblur

class Interface():
    def __init__(self):
        self.nb = newsblur.API()
        self.items = {}
    
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
                #if nogood:
                    story['site_title'] = unreadfeeds['%s' % story['story_feed_id']]
                    unreadstories.append(story)
                    
        self.items['stories'] = unreadstories
        
    def stories(self):
        return self.items
    
    def markAllAsRead(self):
        unreadfeeds = {}
        for item in self.items['stories']:
            if item['story_feed_id'] not in unreadfeeds:
                unreadfeeds[item['story_feed_id']] = []
            
            unreadfeeds[item['story_feed_id']].append(item)
        
        for feed in unreadfeeds:
            items = []
            for item in unreadfeeds[feed]:
                items.append(item['id'])
                
            self.nb.mark_story_as_read(feed, items)
                            
def main():
    newsblur = Interface()
    newsblur.refresh()
    stories = newsblur.stories()
    print stories

if __name__ == "__main__":
    main()

