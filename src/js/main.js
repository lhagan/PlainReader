/* script.js
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

/*global PR, console, $, window, document, open, event, setTimeout, clearTimeout, setInterval */
/*jslint white:	true */

var unreaditems;
var unreadcount = 0;

window.onload = function () {
	"use strict";
	// hard refresh feeds on load
	$('#refresh').trigger('click');
	setInterval(function () {
		// soft refresh feeds every 15 minutes
		PR.refresh(false);
	}, 1000 * 60 * 15);
};

$(document).ready(function () {
	"use strict";
	var hideReadStories,
		clearStories,
		updateUnreadCount,
		getUnread,
		updateFeeds,
		onItemClick,
		bindItemClick,
		bindScroll,
		hide_popover,
		nextStory,
		prevStory,
		key_down,
		nb,
		ip,
        articleview,
		displayed_stories = [],
		all_stories = {},
		article_index = 0;
	
	// check for min browser requirements and whether this is
	// user's first visit
	PR.detect();
	


    hideReadStories = function () {
		// hide read stories;
		/*$('#stories li').not('.unread').each(function () {
			// TODO: add collapsing animation. This works on Safari but not Mobile Safari.
			//$(this).parent().parent().animate({height: 0}, 500);
			$(this).addClass('hidden');
		});*/
		$('#stories li').not('.unread').addClass('hidden');

		// hide the article view
		articleview.hideArticleView();
	};

    clearStories = function () {
		// clear newsblur interface
		nb.clear();

        // clear stories list
        $('#stories li').not('#template').remove();

        // empty out the unreaditems and displayed stories lists
        unreaditems = {};
		displayed_stories = [];
		all_stories = {};

		// hide the article view
		articleview.hideArticleView();

		// zero the unread count
		unreadcount = 0;
		updateUnreadCount();

		console.log("cleared stories");
    };

    updateUnreadCount = function () {
		var oldcount = $('#unreadcount').html();
		console.log('changing unread count from ' + oldcount + ' to ' + unreadcount);
        $('#unreadcount').html(unreadcount);
		document.title = "PlainReader (" + unreadcount + ")";
    };

    getUnread = function (json) {
		console.log('updating list');
		var i,
			list_template = $('#template'),
			site,
			story_obj,
			item;

        unreaditems = json.stories;
        unreadcount = json.unreadcount;
        updateUnreadCount();

        for (i = 0; i < unreaditems.length; i += 1) {
            site = unreaditems[i].story_feed_id;
            story_obj = unreaditems[i];
			if (displayed_stories.indexOf(story_obj.id) === -1) {
				// save to all_stories
				all_stories[article_index] = story_obj;

	            item = list_template.clone();

	            $(item).attr('id', story_obj.id);
	            $(item).removeClass('hidden');

	            $('a .site', item).html(story_obj.site_title);
	            $('a .date', item).html(story_obj.short_parsed_date);
	            $('a .title', item).html(story_obj.story_title);
	            $('a .intro', item).html($.stripTags(story_obj.story_content).substring(0, 250));

	            // TODO: less hacky way to do this?
	            $('a .ident_site', item).html(site);
	            $('a .ident_story', item).html(article_index);
				article_index += 1;

				$('a', item).bind('click', bindItemClick);

	            $(item).appendTo('#stories ul');
				displayed_stories.push(story_obj.id);
				bindScroll();
			}
        }

        // stop spinning refresh button
        $('#refresh_wrapper').removeClass('spinning');
    };

    updateFeeds = function () {
		console.log('got feeds, processing');
		getUnread(nb.items);
    };

	onItemClick = function (item) {
		var site = $('.ident_site', item).html(),
			article_id = $('.ident_story', item).html(),
			id = $(item).parent().attr('id'),
			read = true,
			story_obj = all_stories[article_id],
			list = $('#stories')[0],
			listheight = list.offsetHeight,
			elementheight = $(item).parent().height(),
			currentscroll = list.scrollTop,
			d;
			
		// determine read status
		if ($(item).parent().hasClass('unread')) {
			read = false;
		}

        $('#stories ul li.selected').addClass('read');
        $('#stories ul li').removeClass('selected');

        $(item).parent().addClass('selected');

        // mark article as read
        if (!read) {
			$(item).parent().removeClass('unread');
            unreadcount -= 1;
            updateUnreadCount();
			console.log('marking as read :' + id);
			nb.markRead(site, id);
        }
		
		articleview.hideArticleView();
        articleview.showArticle(story_obj);

        // scroll stories list to keep selected item in center (where possible)
        // TODO: move to plugins
        item.parentNode.scrollIntoView(true);
		currentscroll = list.scrollTop;
        if (list.scrollTop !== (list.scrollHeight - listheight)) {
            list.scrollTop = currentscroll - (listheight / 2 - elementheight / 2);
        }
	};

	bindItemClick = function (event) {
		event.preventDefault();
		onItemClick(this);
	};

	// if we're near the end of the list, get the next page of stories
	bindScroll = function () {
		var element = $('#stories'),
			limit = 0;
		$('#stories').bind('scroll', function () {
			limit = $('ul', element)[0].offsetHeight - element.height() - (3 * 140);
			if (this.scrollTop > limit) {
		        // spin the refresh button to show progress
		        $('#refresh_wrapper').addClass('spinning');
				nb.getNextPage(updateFeeds);
				$(this).unbind('scroll');
			}
		});
	};
	
	PR.refresh = function (hard) {
        // spin the refresh button to show progress
        $('#refresh_wrapper').addClass('spinning');
        // call refresh on server
		console.log('updating feeds');
		nb.refresh(updateFeeds);
		if (hard) {
	        // clear stories list
	        hideReadStories();
		}
	};

    /*
    Refresh Button
    */
    $('#refresh').bind('click', function (event) {
		PR.refresh(true);
		event.preventDefault();
    });

    /*
    Settings Button
    */
    $('#settings').bind('click', function (event) {
		var go = function (response) {
			$('#settings_popover').removeClass('animate');
			if (response === true) {
				$('#login_form .logout').removeClass('hidden');
				$('#login').addClass('hidden');
			} else {
				$('#login_form .logout').addClass('hidden');
				$('#login').removeClass('hidden');
			}
			$('#settings_popover').removeClass('hidden');
		};
		// need to temporarily unbind keydown to prevent interference with form submission
		$(document).unbind('keydown', key_down);
		nb.checkAuth(go);
		event.preventDefault();
    });

    /*
    Mark All Read button
    */
    $('#mark_all_read').bind('click', function (event) {
        // tell server to mark all as read
        $.get('/all_read');
        hideReadStories();
		event.preventDefault();
    });

    /*
    pinboard popup menu
    */
    $('#pinboard').bind('click', function (event) {
        $('#pinboard_popover').toggleClass('hidden');
		event.preventDefault();
    });

    /*
    Send to pinboard (popup with tags)
    */
    $('#send_to_pinboard').bind('click', function (event) {
        var q, d, p;
        q = $('#content header a').attr('href');
        p = $('#content header h1').html();

        // TODO: eliminate this redundancy
        if (document.getSelection) {
            d = document.getSelection();
        } else {
            d = '';
        }

        open('https://pinboard.in/add?showtags=yes&url=' + encodeURIComponent(q) + '&description=' + encodeURIComponent(d) + '&title=' + encodeURIComponent(p), 'Pinboard', 'toolbar=no,width=700,height=600');
        $('#pinboard_popover').addClass('hidden');
		event.preventDefault();
    });

    /*
    Send to pinboard (read later)
    */
    $('#send_to_pinboard_read_later').bind('click', function (event) {
        var q, d, p, t;
        q = $('#content header a').attr('href');
        p = $('#content header h1').html();

        // TODO: why doesn't this work either?
        if (document.getSelection) {
            d = document.getSelection();
        } else {
            d = '';
        }

        t = open('https://pinboard.in/add?later=yes&noui=yes&jump=close&url=' + encodeURIComponent(q) + '&description=' + encodeURIComponent(d) + '&title=' + encodeURIComponent(p), 'Pinboard', 'toolbar=no,width=100,height=100');
        t.blur();
        $('#pinboard_popover').addClass('hidden');
		event.preventDefault();
    });

    /*
    keyboard shortcuts
    */
    nextStory = function (event) {
        var selected = $('#stories .selected'),
			next = selected.next();

        if (next.size() !== 0) {
            $('a', next).trigger('click');
        }
		if (selected.size() === 0) {
			next = $('#stories li').not('.hidden').first();
			onItemClick($('a', next)[0]);
		}
		if (event) {
			event.preventDefault();
		}
    };

    prevStory = function (event) {
        var prev = $('#stories .selected').prev();
        if (prev.length !== 0) {
            onItemClick($('a', prev)[0]);
        }
		if (event) {
			event.preventDefault();
		}
    };

    key_down = function (e) {
        if (e.keyIdentifier === 'Down') {
            nextStory();
            event.preventDefault();
        }

        if (e.keyIdentifier === 'Up') {
            prevStory();
            event.preventDefault();
        }

        if (e.keyIdentifier === 'Enter') {
            $('#content header a').trigger('click');
            event.preventDefault();
        }

		// space bar or forward slash
		if (e.keyCode === 32 || e.keyCode === 191) {
			if (e.shiftKey) {
				$('#content_wrapper').scroll(-400, 750);
			} else {
				$('#content_wrapper').scroll(400, 750);
			}
			event.preventDefault();
		}

		// r or single quote
		if (e.keyCode === 82 || e.keyCode === 222) {
			$('#refresh').trigger('click');
		}
    };

    $(document).bind('keydown', key_down);
    $('#down').bind('click', nextStory);
    $('#up').bind('click', prevStory);

	$('#login').submit(function (event) {
		$('#settings_popover').removeClass('animate');
		clearStories();
		var $form = $(this),
			username = $form.find('input[name="username"]').val(),
			password = $form.find('input[name="password"]').val(),
			callback = function (response) {
				if (response === true) {
					$('#settings_popover').addClass('hidden');
					// re-bind keydown once form is submitted
					$(document).bind('keydown', key_down);

					// slight delay to let the clear mechanisms happen before loading feeds
					setTimeout(function () {
						$('#refresh').trigger('click');
					}, 300);
				} else {
					$form.find('input[name="password"]').val('');
					$('#settings_popover').addClass('animate');
					console.log("incorrect login, try again");
				}
			};
		nb.login(username, password, callback);
		// make sure username is in focus next time
		$('#login_form').find('input[name="username"]').focus();
		event.preventDefault();
	});
	$('#settings_popover .cancel').bind('click', function (event) {
		$('#settings_popover').addClass('hidden');
		$('#login_form').find('input[name="username"]').val('');
		$('#login_form').find('input[name="password"]').val('');

		// make sure username is in focus next time
		$('#login_form').find('input[name="username"]').focus();

		// re-bind keydown on cancel
		$(document).bind('keydown', key_down);
		event.preventDefault();
	});
	$('#login_form .logout').bind('click', function (event) {
		nb.logout();
		$('#login_form').find('input[name="username"]').val('');
		$('#login_form').find('input[name="password"]').val('');
		$('#settings_popover').addClass('hidden');
		clearStories();
		// re-bind keydown on logout
		$(document).bind('keydown', key_down);
		event.preventDefault();
	});

	nb = new PR.Newsblur();
	ip = new PR.Instapaper();
    articleview = new PR.articleview();
	
	// work-around for bug in Mobile Safari that results in zoom-in when rotating
	// from portrait to landscape
	// http://adactio.com/journal/4470/
	(function () {
		if ($.os.ios) {
		    var viewportmeta = document.querySelector('meta[name="viewport"]');
		    if (viewportmeta) {
		        viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
		        document.body.addEventListener('gesturestart', function() {
		            viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
		        }, false);
		    }
		}
	}());
});
