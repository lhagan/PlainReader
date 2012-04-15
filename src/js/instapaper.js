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
			title,
			article;

		root.innerHTML = html;
		for (i = 0; i < allChilds.length; i += 1) {
			if (allChilds[i].id) {
				if (allChilds[i].id === 'titlebar') {
					title = allChilds[i];
				}
				if (allChilds[i].id === 'story') {
					article = allChilds[i];
				}
			}
		}
		return { 'title': title, 'article': article };
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
