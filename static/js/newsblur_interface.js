/* newsblur_interface.js
part of PlainReader by Luke Hagan
created: 2012-03-01
released under the MIT license (see LICENSE.md for details) */

/*global $, print, clearInterval, setInterval, setTimeout, clearTimeout*/

var Newsblur = function () {
	'use strict';
	var that = this,
		processStories,
		processFeeds,
		getPages,
		getStories,
		sortByDate,
		unreadfeeds = {},
		callback,
		complete = false,
		mark_read_queue = {};

	this.items = {'stories': [], 'unreadcount': 0};

	processStories = function (json) {
		var allstories = json.stories,
			story,
			nogood,
			intel,
			i,
			prop;

		print('processing stories');
		print('got ' + allstories.length + ' stories');
		if (allstories.length > 0) {
			for (i = 0; i < allstories.length; i += 1) {
				story = allstories[i];
				if (story.read_status === 0) {
					nogood = false;
					// story is no good if any intelligence attributes are -1
					// but a +1 overrides all
					intel = story.intelligence;
					for (prop in intel) {
						if (intel.hasOwnProperty(prop)) {
							if (parseInt(intel[prop], 10) === -1) {
								nogood = true;
							}
							if (parseInt(intel[prop], 10) === 1) {
								nogood = false;
							}
						}
					}
					if (nogood === false &&
							that.items.stories.containsObjectWithPropertyValue('id', story.id) === false) {
						story.site_title = unreadfeeds[story.story_feed_id];
						that.items.stories.push(story);
					}
				}
				// sort items
				that.items.stories.sort(sortByDate);
			}
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
			if (postdata.length > 0) {
				print(postdata);
				getPages(postdata, 1);
			} else {
				complete = true;
				callback();
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
			if (complete === true || page > 2) {
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

	sortByDate = function (a, b) {
		var toDate = function (d) {
				return d.replaceAt(10, "T");
			},
			dateA = new Date(toDate(a.story_date)),
			dateB = new Date(toDate(b.story_date));

		return dateA - dateB;
	};

	this.refresh = function (call) {
		complete = false;
		callback = call;
		// zero the unread count
		that.items.unreadcount = 0;
		// need to refresh feeds before getting list to ensure count isn't stale
		$.getJSON('/newsblur/reader/refresh_feeds', function () {
			$.getJSON('/newsblur/reader/feeds', processFeeds);
		});
	};

	this.markRead = function (feed_id, story_id) {
		var run,
			interval,
			queue,
			count = 0;
		run = function () {
			var feed,
				queue,
				i,
				postdata = "",
				clear = function (feed) {
					print('mark as read successful');
					count = 0;
					mark_read_queue[feed] = [];
					that.items.unreadcount -= count;
				};
			for (feed in mark_read_queue) {
				if (mark_read_queue.hasOwnProperty(feed)) {
					queue = mark_read_queue[feed];
					if (queue.length > 0) {
						postdata = "feed_id=" + feed;
						for (i = 0; i < queue.length; i += 1) {
							postdata += "&story_id=" + queue[i];
						}
						count = queue.length;
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

// TODO: move to plugins?
// check array for object with property that matches provided value
Array.prototype.containsObjectWithPropertyValue = function (property, value) {
	var i, l = this.length;
	for (i = 0; i < l; i += 1) {
		if (this[i].hasOwnProperty(property) && this[i][property] === value) {
			return true;
		}
	}
	return false;
};


