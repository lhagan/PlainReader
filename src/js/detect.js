/* detect.js
part of PlainReader by Luke Hagan
created: 2012-04-13
released under the MIT license (see LICENSE.md for details) */

/*global console, $, document, escape, unescape, PR */
/*jslint white:	true */

/*
Pops up an intro window if this is the user's first visit.
Determines whether the client is a supported browser/device
and provides a warning if not.
*/
PR.detect = function () {
    "use strict";
    // check for minimum requirements
    var meets_min_requirements = function () {
        var eligible = false;
        // check for WebKit minimum version
        if (($.browser.webkit && parseInt($.browser.version.substring(0, 3), 10) >= 534)) {
            if ($.os.version && parseInt($.os.version[0], 10) >= 5) {
                if ($.os.ipad) {
                    // it's an iPad!
                    eligible = true;
                }
            } else {
                // it's probably a desktop browser!
                eligible = true;
            }
        }
        return eligible;
    },
	
	// handle cookies
    // http://www.w3schools.com/js/js_cookies.asp
    getCookie = function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i += 1) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === c_name) {
                return unescape(y);
            }
        }
    },
    setCookie = function (c_name, value, exdays) {
        var exdate = new Date(),
			c_value;
			
        exdate.setDate(exdate.getDate() + exdays);
        c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
		
        document.cookie = c_name + "=" + c_value;
    },
    checkCookie = function () {
        var returnvisitor = getCookie("plainreader_returnvisitor"),
            closewindow = function () {
                $('.appintro').hide();
                setCookie("plainreader_returnvisitor", "", 365);
                // unbind click events from intro
                $('.appintro').off();
            };
        if (returnvisitor !== undefined) {
		//if (0) {
		    console.log("return visitor");
        } else {
            console.log("new visitor, showing intro");
            $('.appintro').not('.warning').show();
            $('#appintro_backdrop').add('#appintro_window .cancel').click(function (event) {
                closewindow();
                event.preventDefault();
            });
			$('#appintro_window header .img').append($('#settings_popover svg'));
            $('#appintro_window .login_link').click(function (event) {
                closewindow();
                $('#settings').trigger('click');
                event.preventDefault();
            });
            if (!meets_min_requirements()) {
                $('.appintro.warning').show();
            }
        }
    };
    checkCookie();
};