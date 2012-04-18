/* plugins.js
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

/*global $, Zepto, console, window, document, setTimeout */
/*jslint white: true*/

// strip HTML tags
// based on http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
(function($) {
    "use strict";
    $.stripTags = function (content) {
            var tmp = $('<div></div>');
            tmp.html(content);
            return tmp.text();
    };
}(Zepto));


// smooth page scrolling
// based on: https://github.com/madrobby/zepto/issues/401#issuecomment-4156269
// with modifications to scroll div element instead of window
(function($){
    "use strict";
    $.extend($.fn, {
        scroll: function(deltaY, duration) {
            var targetElement = this[0],
                startY = targetElement.scrollTop,
                endY = startY + deltaY,
        
                startT  = +(new Date()),
                finishT = startT + duration,
        
                interpolate = function (source, target, shift) { 
                    return (source + (target - source) * shift); 
                },
        
                easing = function (pos) { 
                    return (-Math.cos(pos * Math.PI) / 2) + 0.5; 
                },
        
                animate = function() {
                    var now = +(new Date()),
                        shift = (now - startT) / duration;
                        
                    if (now > finishT) {
                        shift = 1;
                    }
                    targetElement.scrollTop = Math.floor(interpolate(startY, endY, easing(shift)));
                    if (now < finishT) {
                        setTimeout(animate, 15);
                    }
                };
                
            animate();
        }
    });
}(Zepto));

// check array for object with property that matches provided value
Array.prototype.containsObjectWithPropertyValue = function (property, value) {
    "use strict";
    var i, l = this.length;
    for (i = 0; i < l; i += 1) {
        if (this[i].hasOwnProperty(property) && this[i][property] === value) {
            return true;
        }
    }
    return false;
};
