# PlainReader

PlainReader (working title) is a clean, minimal web-based client for the excellent [NewsBlur](http://newsblur.com) RSS reader. It's still in an **early beta** state with only the bare minimum of features to work as a functional news reader. PlainReader is designed to work on WebKit browsers only, such as Safari (including iPad) and Chrome.

Go try it out: *hosted version coming soon*

## Features

1. Simple list of unread items from NewsBlur's River of News
2. One-click to send to Instapaper
3. Pinboard integration ('popup with tags' & 'read later')
4. Full article mode using [Instapaper's text engine](http://www.instapaper.com/extras) (just click the article title)
5. 20px Georgia article font
6. Keyboard shortcuts: up/down arrows to flip through articles, enter for full article mode (see above), spacebar to smoothly scroll articles

## Screenshot (iPad)
![screenshot](https://github.com/lhagan/PlainReader/raw/master/plainreader_screenshot.jpg)

## Why

I started building PlainReader out of a desire for a simple, minimal RSS reading experience akin to that of Silvio Rizzi's [Reeder](http://reederapp.com),[^1] but in a web browser (and using NewsBlur instead of Google Reader). The goal is a single webapp that works equally well on my 11" MacBook Air and iPad 1. If you have a bigger or smaller screen, well, your mileage may vary. It's also not intended to be a replacement for the default NewsBlur interface -- PlainReader will never reach feature parity with NewsBlur's web UI, that's not the point.

## How

PlainReader consists of a web (HTML5, CSS3, Javascript) front-end and an intermediary server that proxies NewsBlur to get around cross-domain restrictions and strip down the data transferred to just what's needed. Some acknowledgements:

* [NewsBlur](http://newsblur.com): web-based RSS reader (think Google Reader, but better), does all the actual work fetching feeds and such.
* [Zepto](http://zeptojs.com/): minimalist JavaScript framework with jQuery syntax, specifically designed for mobile WebKit.
* [Instapaper](http://www.instapaper.com): text engine provides cleaned up article content to minimize loading times (and advertising).
* [HTML5 Boilerplate](http://html5boilerplate.com/): HTML/CSS/JS template.
* [Iconic](http://somerandomdude.com/work/iconic/): free, minimal icons distributed (among other things) in OTF font format, allowing PlainReader's interface to get by without a single image.
* [nginx](http://wiki.nginx.org/Main): HTTP server that proxies NewsBlur.

## Roadmap

1. stop managing data in the DOM (or at least clean it up)
2. <del>enable mark as read on a per item basis (currently, only mark all as read is enabled)</del> (done)
3. interface additions/refinements:
    * <del>unread count</del>(done) with intelligence breakdown
    * <del>scroll story list to keep the currently selected item in the middle (where possible)</del> (done)
    * feed favicons & intelligence classifiers in story list
4. <del>'mark all as read' button</del> (done)
5. intelligence <del>panel</del> tag buttons in the article header
6. <del>load multiple 'pages' of unread items (currently, you have to hit refresh feeds once you get to the bottom of the list)<del> (done)
7. <del>Windows support</del> (done)

I don't plan on ever supporting:

* changing the Intelligence filter mode (only yellow and green items are displayed)
* non-WebKit browsers
* <del>iPhone, or anything else smaller than an iPad</del> OK, maybe there'll be an iPhone version eventually
* reading individual feeds (instead of the River of News)
* social anything (unless you count pinboard)

That said, I'll consider patches / pull requests on any of these if you figure out how to implement them without adding a bunch of complexity or cluttering up the interface.

[^1]: the UI is presently a brazen copy of Reeder for iPad, albeit with lots fewer features and no textures or gradients. File this under 'imitation is the sincerest form of flattery.'
