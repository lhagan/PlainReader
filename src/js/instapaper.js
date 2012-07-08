/* instapaper.js
part of PlainReader by Luke Hagan
created: 2012-03-04
released under the MIT license (see LICENSE.md for details) */

/*global $, PR, console, document*/

PR.Instapaper = function () {
	"use strict";
	var parseHTML = function (html) {
		var root = document.createElement("div"),
			allChilds = root.childNodes,
			i,
			elem,
            title,
            site,
            author,
            url,
            article,
            output;

		root.innerHTML = html;
		for (i = 0; i < allChilds.length; i += 1) {
            elem = allChilds[i];
			if (elem) {
				if (elem.id === 'titlebar') {
                    $(elem).find('img').remove();
					title = $('h1', elem).html();
                    site = $('.original', elem).html() || "";
                    author = $('.author', elem).html() || "";
                    url = $('.original', elem).attr('href');
                    console.log(url);
				}
				if (elem.id === 'story') {
					article = elem;
				}
			}
		}
		$(article).append('<br /><p><em>Cleaned up text view provided by <a href="http://www.instapaper.com">Instapaper</em></a>.</p>');

        output = {
			long_parsed_date: "",
			story_title: title,
			site_title: site,
			story_authors: author,
			story_content: article,
			story_permalink: url
		};

        return output;
	};

	this.getArticle = function (url, callback) {
		var instapaper_url = '/instapaper/text?u=' + url,
			process = function (data) {
				var article = parseHTML(data);
				callback(article);
			};
		$.ajax({
			type: 'GET',
			url: instapaper_url,
			success: process,
			error: function (xhr, type) {
				console.log("error loading from instapaper!  " + type);
				process('<div id="titlebar"><h1>Error: could not load article from Instapaper</h1></div><div id="story"></div>');
			}
		});
	};
};
