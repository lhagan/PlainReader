/* newsblur_interface.js
part of PlainReader by Luke Hagan
created: 2012-03-01
released under the MIT license (see LICENSE.md for details) */

/*global $, PR, console, clearInterval, setInterval, setTimeout, clearTimeout*/

PR.Newsblur = function () {
	'use strict';
	var that = this,
		processStories,
		processFeeds,
		getPage,
		getStories,
		sortByDate,
		unreadfeeds = {},
		callback,
		mark_read_queue = {},
		current_page = 0,
		page_count = 0,
		postdata = "";

	this.items = {'stories': [], 'unreadcount': 0};

	processStories = function (json) {
		var allstories = json.stories,
			story,
			nogood,
			intel,
			i,
			prop,
			page_empty = true;

		console.log('processing stories');
		console.log('got ' + allstories.length + ' stories');
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
								break;
							}
						}
					}
					if (nogood === false &&
							that.items.stories.containsObjectWithPropertyValue('id', story.id) === false) {
						story.site_title = unreadfeeds[story.story_feed_id];
						that.items.stories.push(story);
						page_empty = false;
					}
				}

				if (page_empty) {
					// page was empty, try next
					that.getNextPage(callback);
				} else {
					// sort items by date
					that.items.stories.sort(sortByDate);
				}
			}
		} else {
			that.getNextPage();
		}
		callback();
		if (allstories.length < 10) {
			that.getNextPage(callback);
		}
	};

	processFeeds = function (json) {
		var feeds = json.feeds,
			feed,
			feed_id,
			old_unreadcount = that.items.unreadcount;

		postdata = "";
		// zero the unread count
		that.items.unreadcount = 0;

		console.log('processing feeds');
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
			// only load more pages if we're already on page 1
			// this assumes that new items always come in at the top of the list
			page_count = Math.ceil((that.items.unreadcount - old_unreadcount) / 18);
			if (postdata.length > 0 && current_page <= 1 && page_count > 0) {
				//console.log(postdata);
				current_page = page_count;
				getPage(current_page);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	getStories = function (data) {
		console.log('getting stories');
		//console.log(data);
		$.ajax({
			type: 'POST',
			url: '/newsblur/reader/river_stories',
			data: data,
			dataType: 'json',
			success: processStories,
			error: function (xhr, type) { console.log("error! " + xhr + " " + type); }
		});
	};

	getPage = function (page) {
		if (page > 0) {
			console.log('getting page ' + page);
			getStories(postdata + "page=" + page);
		} else {
			console.log('error, invalid page number: ' + page);
		}
	};

	sortByDate = function (a, b) {
		// parse date string into date object
		// http://stackoverflow.com/a/5324266
		var toDate = function (d) {
				var arr = d.split(/[- :]/),
				    date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
				return date;
			},
			dateA = toDate(a.story_date),
			dateB = toDate(b.story_date);

		return dateA - dateB;
	};

	this.getNextPage = function (call) {
		callback = call;
		if (current_page > 1) {
			current_page -= 1;
			getPage(current_page);
		} else {
			callback();
		}
	};

	this.clear = function () {
		this.items = {'stories': [], 'unreadcount': 0};
		current_page = 0;
		page_count = 0;
	};

	this.refresh = function (call) {
		callback = call;
		// need to refresh feeds before getting list to ensure count isn't stale
		$.getJSON('/newsblur/reader/refresh_feeds', function () {
			$.getJSON('/newsblur/reader/feeds', processFeeds);
		});
	};

	this.markRead = function (feed_id, story_id) {
		var run,
			interval,
			queue;

		run = function () {
			var feed,
				queue,
				i,
				data = "",
				clear = function (feed, count) {
					console.log('mark as read successful');
					mark_read_queue[feed] = [];
					that.items.unreadcount -= count;
				},

				ajax = function (data) {
					$.ajax({
						type: 'POST',
						url: '/newsblur/reader/mark_story_as_read',
						data: data,
						dataType: 'json',
						//success: function () { clear(feed); },
						error: function (xhr, type) { console.log("error! " + xhr + " " + type); }
					});
				};

			for (feed in mark_read_queue) {
				if (mark_read_queue.hasOwnProperty(feed)) {
					queue = mark_read_queue[feed];
					if (queue.length > 0) {
						data = "feed_id=" + feed;
						for (i = 0; i < queue.length; i += 1) {
							data += "&story_id=" + queue[i];
							//that.items.unreadcount -= 1;
						}
						clear(feed, queue.length);
						ajax(data);
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
			error: function (xhr, type) { console.log("error! " + xhr + " " + type); }
		});
    };

	this.logout = function () {
		$.post('/newsblur/api/logout');
	};

    this.checkAuth = function (call) {
        this.login('', '', call);
	};
};
