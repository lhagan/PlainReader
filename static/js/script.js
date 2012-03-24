/* script.js
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

/*global stripTags, console, $, document, open, event, smoothScroll, Newsblur, Instapaper */

var unreaditems;
var unreadcount = 0;

/*
window.onload = function(){ 
	$('#refresh').trigger('click'); 
}
*/

$(document).ready(function () {
	"use strict";
	var instapaperText,
		bindInstapaperText,
		showArticleView,
		hideArticleView,
		hideReadStories,
		clearStories,
		updateUnreadCount,
		getUnread,
		updateFeeds,
		onItemClick,
		bindItemClick,
		bindScroll,
		nextStory,
		prevStory,
		key_down,
		nb,
		ip,
		displayed_stories = [],
		all_stories = {},
		article_index = 0;

	instapaperText = function (data) {
        $('#content .body_text').html(data.title).append(data.article);
        $('#content .body_text a').attr('target', '_blank');
		$('#content .body_text a').attr('rel', 'noreferrer');
        $('#content header a').unbind('click');
		console.log('got article');

        $('#content header a').bind('click', function (event) {
            // TODO: less hacky way to do this?
			console.log('returning to regular article view');
            var story = $('.selected .ident_story').html(),
				story_obj = unreaditems[story];
            $('#content .body_text').html(story_obj.story_content);
            $('#content header a').unbind('click');
            bindInstapaperText($('#content header a'));
            event.preventDefault();
        });
    };

	bindInstapaperText = function (element) {
        element.bind('click', function (event) {
			ip.getArticle($('#content header a').get(0), instapaperText);
			console.log('getting article from instapaper');
            event.preventDefault();
        });
	};

    showArticleView = function () {
        // scroll article back to top
        $('#content_wrapper').get(0).scrollTop = 0;
        $('#content').removeClass('hidden');
        $('#pinboard').removeClass('hidden');
        $('#open_in_new_window').removeClass('hidden');
        $('#send_to_instapaper iframe').show();
    };

    hideArticleView = function () {
        $('#content').addClass('hidden');
        $('#pinboard').addClass('hidden');
        $('#open_in_new_window').addClass('hidden');
        $('#send_to_instapaper iframe').hide();
    };

    hideReadStories = function () {
		// hide read stories;
		$('#stories li a .status').each(function () {
			if ($(this).html() === '1') {
				// TODO: add collapsing animation. This works on Safari but not Mobile Safari.
				//$(this).parent().parent().animate({height: 0}, 500);
				$(this).parent().parent().addClass('hidden');
			}
		});

        // hide the article view
        hideArticleView();
    };

    clearStories = function () {
        // clear stories list
        $('#stories li').not('#template').remove();

        // empty out the unreaditems and displayed stories lists
        unreaditems = {};
		displayed_stories = [];
		all_stories = {};

        // hide the article view
        hideArticleView();

		// zero the unread count
		unreadcount = 0;
		updateUnreadCount();

		nb.clear();
		console.log("cleared stories");
    };

    updateUnreadCount = function () {
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
	            $('a .intro', item).html(stripTags(story_obj.story_content).substring(0, 250));

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
			status = $('.status', item).html(),
			story_obj = all_stories[article_id],
			list = $('#stories')[0],
			listheight = list.offsetHeight,
			elementheight = $(item).parent().height(),
			currentscroll = list.scrollTop,
			d;

		// unbind instapaper text link (sometimes conflicts with new bind)
		$('#content header a').unbind('click');

        $('#stories ul li.selected').css({opacity: 0.5});
        $('#stories ul li').removeClass('selected');

        $(item).parent().addClass('selected');

        // mark article as read
        if (parseInt(status, 10) === 0) {
            $('.status', item).html('1');
            unreadcount -= 1;
            updateUnreadCount();
			console.log('marking as read :' + id);
			nb.markRead(site, id);
        }

        showArticleView();

        $('#content header time').html(story_obj.long_parsed_date);
        $('#content header h1').html(story_obj.story_title);
        $('#content header .site').html(story_obj.site_title);
        $('#content header .author').html(story_obj.story_authors);
        $('#content .body_text').html(story_obj.story_content);
        //$('#content .body_text a').attr('target', '_blank');
		$('#content .body_text a').attr('rel', 'noreferrer');
        $('#content header a').attr('href', story_obj.story_permalink);
		$('#open_in_new_window').attr('href', story_obj.story_permalink);

        if (document.getSelection) {
            d = document.getSelection();
        }

        // TODO: why doesn't description work?
        $('#send_to_instapaper iframe').attr('src', 'http://www.instapaper.com/e2?url=' + encodeURIComponent(story_obj.story_permalink) + '&title=' + encodeURIComponent(story_obj.story_title) + '&description=' + encodeURIComponent(d));

        bindInstapaperText($('#content header a'));

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
				nb.getNextPage();
				$(this).unbind('scroll');
			}
		});
	};

    /*
    Refresh Button
    */
    $('#refresh').bind('click', function (event) {
        // spin the refresh button to show progress
        $('#refresh_wrapper').addClass('spinning');
        // call refresh on server
        //$.get('/refresh', updateFeeds);
		console.log('updating feeds');
		nb.refresh(updateFeeds);
        // clear stories list
        hideReadStories();
		event.preventDefault();
    });

    /*
    Settings Button
    */
    $('#settings').bind('click', function (event) {
		var go = function (response) {
			if (response === true) {
				$('#login_form .logout').removeClass('hidden');
				$('#login input').addClass('hidden');
			} else {
				$('#login_form .logout').addClass('hidden');
				$('#login input').removeClass('hidden');
			}
			$('#login_form_wrapper').removeClass('hidden');
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
    Open original article in a new tab/window
    */
    /*$('#open_in_new_window').bind('click', function (event) {
        open($('#content header a').attr('href'));
		event.preventDefault();
    });*/

    //updateFeeds();

	/*
	Footnotes drawer based on FOOTNOTIFY bookmarklet.
	By Hans Petter Eikemo, http://openideas.ideon.co http://twitter.com/hpeikemo.
	No rights reserved, please use attribution if deriving on my work.
	Web: https://gist.github.com/1046538
	Modified by Luke Hagan for PlainReader 2012-03-17
	*/
	var selectorRegExp = /[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\[\\\]\^\`\{\|\}\~]/g;
	$("#content .body_text sup a").click(function (event) {
		var target = $(event.currentTarget),
			href = target.attr('href'),
			selector,
			footnote_el;
		if (href.indexOf('#') === 0) {
			selector = '#' + href.substr(1).replace(selectorRegExp, '\\$&');
			footnote_el = $(selector);
			if (footnote_el.length > 0) {
				//No paragraphs inside, better take precautions, it might be a backlink or have no content.
				if (footnote_el.children('p').length === 0) {
					//let it pass if it is a list item.
					if (footnote_el.filter('li').length === 0) {
						//return; 
					}
				}
				target.parent().addClass('selected');
				$('#detail_drawer .content').html(footnote_el.html());
		        $('#detail_drawer .content a').attr('target', '_blank');
				$('#detail_drawer .content a').attr('rel', 'noreferrer');

				$('#detail_drawer').animate({ height: 60 }, { duration: 500, complete: function () {
					$("#content").click(function (event) {
						$('#content sup').removeClass('selected');
						$('#detail_drawer').animate({height: 0}, { duration: 500, complete: function () {
							$('#detail_drawer .content').html('');
							$("#content").unbind('click');
						}});
						event.preventDefault();
					});
				}});
			}
		}
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
				smoothScroll('content_wrapper', -400, 750);
			} else {
				smoothScroll('content_wrapper', 400, 750);
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
		$('#login_form').removeClass('animate');
		clearStories();
		var $form = $(this),
			username = $form.find('input[name="username"]').val(),
			password = $form.find('input[name="password"]').val(),
			callback = function (response) {
				if (response === true) {
					$('#login_form_wrapper').addClass('hidden');
					$('#refresh').trigger('click');
					// re-bind keydown once form is submitted
					$(document).bind('keydown', key_down);
				} else {
					$form.find('input[name="password"]').val('');
					$('#login_form').addClass('animate');
					console.log("incorrect login, try again");
				}
			};
		nb.login(username, password, callback);
		// make sure username is in focus next time
		$('#login_form').find('input[name="username"]').focus();
		event.preventDefault();
	});
	$('#login_form .cancel').bind('click', function (event) {
		$('#login_form_wrapper').addClass('hidden');
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
		$('#login_form_wrapper').addClass('hidden');
		clearStories();
		// re-bind keydown on logout
		$(document).bind('keydown', key_down);
		event.preventDefault();
	});

	nb = new Newsblur();
	ip = new Instapaper();
});
