/* detail.js
part of PlainReader by Luke Hagan
created: 2012-07-07
released under the MIT license (see LICENSE.md for details) */

/*global console, $, document, PR, open, setTimeout */
/*jslint white: true */

/*
Manages the detail popover.
*/
PR.detailview = function () {
    "use strict";
    var that = this,
        articleview = null,
        hide_popover = function () {
            console.log('hiding preview popover');
            $('#detail_popover').addClass('hidden');
            $('#detail_popover.expanded .content').addClass('hidden');
            $('#detail_popover .toolbar').removeClass('hidden');
            $('#detail_popover').removeAttr('style');
            $('#detail_popover .arrow').css('right', '30px');
            $('#detail_popover').removeClass('expanded');
            $('#content_wrapper a.selected').removeClass('selected');
            $('#detail_popover .content').height(0);
            $('#detail_popover .toolbar .title').html('');
            $('#detail_popover .content').css({ 'margin-top': 10 });
            $("#content_wrapper").unbind('click');
        },

        /*
        Detail preview popover
        */
        bind_deselect = function () {
            $("#content_wrapper").click(function (event) {
                // unhighlight link
                if ($(event.target).closest('#detail_popover').length === 0) {
                    hide_popover();
                    event.preventDefault();
                }
            });
        },

        /*
        Preview links in detail popover
        */
        preview_link = function (event, that, loc_left) {
            var body_width = $('#content .body_text').width(),
                show_detail = function () {
                    //bind_deselect();
                    // highlight link
                    $(that).addClass('selected');
                    // make sure the view is scrolled to the top
                    $('#detail_popover .content').scrollTop = 0;

                    $('#detail_popover .content a').attr('target', '_blank');
                    $('#detail_popover .content a').attr('rel', 'noreferrer');

                    $('#detail_popover .content').removeClass('hidden');
                },
                handle_text = function (link) {
                    // show and spin progress indicator
                    $('#progress_wrapper').removeClass('hidden').addClass('spinning');
                    
                    console.log('getting link from instapaper');
                    hide_popover();
                    articleview.getInstapaper(link);
                },
                handle_footnote = function () {
                    /*
                    Footnotes popover based on FOOTNOTIFY bookmarklet.
                    By Hans Petter Eikemo, http://openideas.ideon.co http://twitter.com/hpeikemo.
                    No rights reserved, please use attribution if deriving on my work.
                    Web: https://gist.github.com/1046538
                    Heavily modified by Luke Hagan for PlainReader 2012-03-17, 2012-04-09
                    */
                    var target = $(that),
                        href = target.attr('href'),
                        rel = href.split('#'),
                        footnote_el,
                        selectorRegExp = /[!"#\$%&'\(\)\*\+,\.\/:;<=>\?@\[\\\]\^`{\|}~]/g;

                    if (rel.length >= 2) {
                        rel = '#' + rel[1].replace(selectorRegExp,'\\$&');
                        footnote_el = $(rel);
                        if (footnote_el.length > 0) {
                            $('#detail_popover .content').html(footnote_el.html());
                            $('#detail_popover').css({ left: 56, width: body_width });
                            $('#detail_popover .arrow').css({ right: body_width - loc_left - 3 });
                            $('#detail_popover .content').css({ height: 'auto' });
                            show_detail();
                        } else {
                            hide_popover();
                        }
                    }
                };

            if ($(that).parent().is('sup')) {
                handle_footnote();
            } else {
                handle_text($(that).attr('href'));
            }
        };
        
    this.articleview = null;
        
    this.hidePopover = function () {
        hide_popover();
    };
        
    this.bindDetail = function (av) {
        articleview = av;
        $($('#content .body_text a')).click(function (event) {
            var that = this,
                loc_left = event.pageX - 412,
                loc_top = $(this).offset().top + $('#content_wrapper').get(0).scrollTop + $(this).offset().height - 35;

            if (loc_left < 5) {
                loc_left = 5;
            }
                
            // don't open the preview popover if user is holding down the cmd/ctl key
            // instead, open a in a new window in background
            if (!event.ctrlKey && !event.metaKey) {
                if ($('#detail_popover').hasClass('hidden')) {
                    console.log('showing preview popover');
                    $('#detail_popover').css({ left: loc_left, top: loc_top });
                    $('#detail_popover .toolbar a').unbind('click');
                    if ($(that).parent().is('sup')) {
                        console.log('footnote');
                        $('#detail_popover .toolbar').addClass('hidden');
                        preview_link(event, that, loc_left);
                    } else {
                        $('#detail_popover .toolbar .preview a').bind('click', function (event) {
                            preview_link(event, that, loc_left);
                            event.preventDefault();
                        });
                    }
                    $('#detail_popover').addClass('expanded');
                    $('#detail_popover .toolbar .newtab a').click(function (event) {
                        open($(that).attr('href'));
                        hide_popover();
                        event.preventDefault();
                    });
                    $('#detail_popover').removeClass('hidden');
                    setTimeout(function () {
                        bind_deselect();
                    }, 250);
                } else {
                    hide_popover();
                }
                event.preventDefault();
            }
        });
    };
};