/*global $, console, document*/

var Instapaper = function () {
	"use strict";
	var parseHTML = function (html) {
		var root = document.createElement("div"),
			allChilds = root.childNodes,
			i,
			article;

		root.innerHTML = html;
		for (i = 0; i < allChilds.length; i += 1) {
			if (allChilds[i].id && allChilds[i].id === 'story') {
				//return(allChilds[i]);
				article = allChilds[i];
			}
		}
		return article;
	};

	this.getArticle = function (url, callback) {
		var instapaper_url = '/instapaper/text?u=' + url,
			process = function (data) {
				var article = parseHTML(data);
				callback(article);
			};
		$.get(instapaper_url, process);
	};
};
