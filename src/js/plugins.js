/* plugins.js
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

/*global $, console, window */
/*jslint white:	true*/

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; try { args.callee = f.caller; } catch(e) {} newarr = [].slice.call(args); if (typeof console.log === 'object') { log.apply.call(console.log, console, newarr); } else { console.log.apply(console, newarr);}}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

// strip HTML tags
// http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
function stripTags(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

// page scrolling
// based on: https://github.com/madrobby/zepto/issues/401#issuecomment-4156269
// with modifications to scroll div element instead of window
smoothScroll = function(element, deltaY, duration) {
	var targetElement = document.getElementById(element);
	var startY = targetElement.scrollTop;
    var endY = startY + deltaY;

    var startT  = +(new Date());
    var finishT = startT + duration

    var interpolate = function (source, target, shift) { 
        return (source + (target - source) * shift); 
    };

    var easing = function (pos) { 
        return (-Math.cos(pos * Math.PI) / 2) + .5; 
    };

    var animate = function() {
        var now = +(new Date());
        var shift = (now > finishT) ? 1 : (now - startT) / duration;
		
		targetElement.scrollTop = Math.floor(interpolate(startY, endY, easing(shift)));
        (now > finishT) || setTimeout(animate, 15);
    };

    animate();
};

// check array for object with property that matches provided value
Array.prototype.containsObjectWithPropertyValue = function (property, value) {
	var i, l = this.length;
	for (i = 0; i < l; i += 1) {
		if (this[i].hasOwnProperty(property) && this[i][property] === value) {
			return true;
		}
	}
	return false;
};

// work-around for bug in Mobile Safari that results in zoom-in when rotating
// from portrait to landscape
// http://adactio.com/journal/4470/
if ($.os.ios) {
  var viewportmeta = document.querySelector('meta[name="viewport"]');
  if (viewportmeta) {
    viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
    document.body.addEventListener('gesturestart', function() {
      viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
    }, false);
  }
};
