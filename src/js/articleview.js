/* articleview.js
part of PlainReader by Luke Hagan
created: 2012-07-07
released under the MIT license (see LICENSE.md for details) */

/*global console, $, document, PR */
/*jslint white: true */

/*
Manages state for the main article view.
*/
PR.articleview = function () {
    "use strict";
    var that = this,
        stack = [],
        position = 0,
        
        ip = new PR.Instapaper(),
        detailview = new PR.detailview(),
        
        showArticleView = function (article) {
            var content = $('#content'),
                header = $('header', content),
                body_text = $('.body_text', content),
                d;
            
            // make sure popover is hidden
            detailview.hidePopover();
            
            $('time', header).html(article.long_parsed_date);
            $('h1', header).html(article.story_title);
            $('.site', header).html(article.site_title);
            $('.author', header).html(article.story_authors);
            body_text.html(article.story_content);
            $('a', body_text).attr('target', '_blank').attr('rel', 'noreferrer');
            $('sup a', body_text).removeAttr('title');
            $('a', header).attr('href', article.story_permalink);
            $('#open_in_new_window').attr('href', article.story_permalink);
                
            if (document.getSelection) {
                d = document.getSelection();
            }

            // TODO: why doesn't description work?
            $('#send_to_instapaper iframe').attr('src', 'http://www.instapaper.com/e2?url=' + encodeURIComponent(article.story_permalink) + '&title=' + encodeURIComponent(article.story_title) + '&description=' + encodeURIComponent(d));
            
            // scroll article back to top
            $('#content_wrapper').get(0).scrollTop = 0;
            $('#content').removeClass('hidden');
            $('#pinboard').removeClass('hidden');
            $('#open_in_new_window').removeClass('hidden');
            $('#send_to_instapaper iframe').show();
            
            // bind detail functions (preview footnotes, inline links, etc.)
            detailview.bindDetail(that);
        },
        
        instapaperText = function (article) {   
            showArticleView(article);
            console.log('got article');

            // hide and stop progress indicator
            $('#progress_wrapper').addClass('hidden').removeClass('spinning');
            
            // retain state
            stack.push(article);
            position = 1;
        };
        
    this.showArticle = function (article) {
        stack = [];
        stack[0] = article;
        
        showArticleView(article);
    };
    
    this.hideArticleView = function () {
        $('#content').addClass('hidden');
        $('#pinboard').addClass('hidden');
        $('#open_in_new_window').addClass('hidden');
        $('#send_to_instapaper iframe').hide();
        stack = [];
        position = 0;
    };
    
    this.getInstapaper = function (url) {
        console.log('getting article from instapaper');
        // scroll article back to top
        $('#content_wrapper').get(0).scrollTop = 0;
        // show and spin progress indicator
        $('#progress_wrapper').removeClass('hidden').addClass('spinning');
        ip.getArticle(url, instapaperText);  
    };
    
    this.toggleArticle = function () {
        if (position === 0) {
            that.getInstapaper($('#content header a').get(0));
        } else {
            console.log('popping article view');
            position = 0;
            showArticleView(stack[position]);
            stack.pop();
        }
    };
    
    $('#content header a').on('click', function (event) {
        that.toggleArticle();
        console.log('toggling article');
        event.preventDefault();
    });
};