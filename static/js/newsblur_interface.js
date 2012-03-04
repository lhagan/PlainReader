/*global $, console, clearInterval, setInterval*/

var Newsblur = function () {
	"use strict";
	var that = this,
		processStories,
		processFeeds,
		getPages,
		getStories,
		unreadfeeds = {},
		callback,
		complete = "false";

	this.items = {'stories': [], 'unreadcount': 0};

	processStories = function (json) {
		var allstories = json.stories,
			unreadstories = [],
			story,
			nogood,
			intel,
			i,
			j;

		if (allstories.length > 0) {
			for (i = 0; i < allstories.length; i += 1) {
				story = allstories[i];
				if (story.read_status === 0) {
					nogood = 'true';
					// story is no good if any intelligence attributes are -1
					// but a +1 overrides all
					intel = story.intelligence;
					for (j = 0; j < intel.length; j += 1) {
						if (parseInt(intel[j], 10) === -1) {
							nogood = 'true';
						}
						if (parseInt(intel[j], 10) === 1) {
							nogood = 'false';
						}
					}
					if (nogood !== 'false') {
						story.site_title = unreadfeeds[story.story_feed_id];
						unreadstories.push(story);
					}
				}
			}
			that.items.stories = unreadstories;
			callback();
		} else {
			complete = 'true';
		}
	};

	processFeeds = function (json) {
		var feeds = json.feeds,
			feed,
			feed_id,
			postdata;

		for (feed_id in feeds) {
			if (feeds.hasOwnProperty(feed_id)) {
				feed = feeds[feed_id];
				if (feed.ps !== 0 || feed.nt !== 0) {
					unreadfeeds[feed_id] = feed.feed_title;
					that.items.unreadcount += (feed.ps + feed.nt);
					postdata += 'feeds=' + feed_id + '&';
					// mark read queue stuff here
				}
			}
		}
		getPages(postdata, 1);
	};

	getStories = function (postdata) {
		$.ajax({
			type: 'POST',
			url: '/newsblur/reader/river_stories',
			data: postdata,
			dataType: 'json',
			async: true,
			success: processStories,
			error: function (xhr, type) { console.log("error!" + xhr + " " + type); }
		});
	};

	getPages = function (postdata, page) {
		var run, interval;
		run = function () {
			if (complete === 'true' || page === 2) { // remove page check
				clearInterval(interval);
			}
			getStories(postdata + "page=" + page);
			page += 1;
		};
		interval = setInterval(run, 10000);
		run();
	};

	this.refresh = function (call) {
		callback = call;
		// zero the unread count
		that.items.unreadcount = 0;
		$.getJSON('/newsblur/reader/feeds', processFeeds);
	};
};
