/*global $, print, clearInterval, setInterval, setTimeout, clearTimeout*/

var Newsblur = function () {
	"use strict";
	var that = this,
		processStories,
		processFeeds,
		getPages,
		getStories,
		unreadfeeds = {},
		callback,
		complete = false,
		mark_read_queue = {};

	this.items = {'stories': [], 'unreadcount': 0};

	processStories = function (json) {
		var allstories = json.stories,
			unreadstories = [],
			story,
			nogood,
			intel,
			i,
			j;

		print('processing stories');
		print('got ' + allstories.length + ' stories');
		if (allstories.length > 0) {
			for (i = 0; i < allstories.length; i += 1) {
				story = allstories[i];
				print(story.story_title);
				if (story.read_status === 0) {
					nogood = true;
					// story is no good if any intelligence attributes are -1
					// but a +1 overrides all
					intel = story.intelligence;
					print(intel);
					for (j = 0; j < intel.length; j += 1) {
						if (parseInt(intel[j], 10) === -1) {
							nogood = true;
						}
						if (parseInt(intel[j], 10) === 1) {
							nogood = false;
						}
					}
					if (nogood !== false) {
						story.site_title = unreadfeeds[story.story_feed_id];
						unreadstories.push(story);
					}
				}
			}
			that.items.stories = unreadstories;
		}
		if (allstories.length < 18) {
			complete = true;
		}
		callback();
	};

	processFeeds = function (json) {
		var feeds = json.feeds,
			feed,
			feed_id,
			postdata = "";

		print('processing feeds');
		print(feeds);

		if (feeds !== undefined && Object.keys(feeds).length > 0) {
			for (feed_id in feeds) {
				if (feeds.hasOwnProperty(feed_id)) {
					feed = feeds[feed_id];
					if (feed.ps !== 0 || feed.nt !== 0) {
						unreadfeeds[feed_id] = feed.feed_title;
						that.items.unreadcount += (feed.ps + feed.nt);
						postdata += 'feeds=' + feed_id + '&';
					}
					if (!mark_read_queue.hasOwnProperty(feed_id)) {
						mark_read_queue[feed_id] = [];
					}
				}
			}
			print('postdata: ' + postdata.length);
			if (postdata.length === 0) {
				getPages(postdata, 1);
			}
		} else {
			complete = true;
			callback();
		}
	};

	getStories = function (postdata) {
		print('getting stories');
		print(postdata);
		$.ajax({
			type: 'POST',
			url: '/newsblur/reader/river_stories',
			data: postdata,
			dataType: 'json',
			success: processStories,
			error: function (xhr, type) { print("error! " + xhr + " " + type); }
		});
	};

	getPages = function (postdata, page) {
		var run, interval;
		run = function () {
			if (complete === true) {
				clearInterval(interval);
			} else {
				print('getting page ' + page);
				getStories(postdata + "page=" + page);
				page += 1;
			}
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

	this.markRead = function (feed_id, story_id) {
		var run,
			interval,
			queue;
		run = function () {
			var feed,
				queue,
				i,
				postdata = "",
				clear = function (feed) {
					print('mark as read successful');
					mark_read_queue[feed] = [];
				};
			for (feed in mark_read_queue) {
				if (mark_read_queue.hasOwnProperty(feed)) {
					queue = mark_read_queue[feed];
					if (queue.length > 0) {
						postdata = "feed_id=" + feed;
						for (i = 0; i < queue.length; i += 1) {
							postdata += "&story_id=" + queue[i];
						}
						$.ajax({
							type: 'POST',
							url: '/newsblur/reader/mark_story_as_read',
							data: postdata,
							dataType: 'json',
							success: function () { clear(feed); },
							error: function (xhr, type) { print("error! " + xhr + " " + type); }
						});
					}
				}
			}
		};

		queue = function (auth) {
			if (auth === true) {
				clearTimeout(interval);

				mark_read_queue[feed_id].push(story_id);
				if (mark_read_queue[feed_id].length >= 5) {
					run();
				} else {
					interval = setTimeout(run, 5000);
				}
			}
		};

		this.checkAuth(queue);
	};

    this.login = function (username, password, call) {
		var check = function (json) {
			call(json.authenticated);
		};
		$.ajax({
			type: 'POST',
			url: '/newsblur/api/login',
			data: {'username': username, 'password': password},
			dataType: 'json',
			success: check,
			error: function (xhr, type) { print("error! " + xhr + " " + type); }
		});
    };

	this.logout = function () {
		$.post('/newsblur/api/logout');
	};

    this.checkAuth = function (call) {
        this.login('', '', call);
	};
};
