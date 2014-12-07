# PlainReader

__Note__: PlainReader is no longer under development.

PlainReader (working title) is a clean, minimal web-based client for the excellent [NewsBlur](http://newsblur.com) RSS reader. It's still in an **early beta** state with only the bare minimum of features to work as a functional news reader. PlainReader is designed to work on WebKit browsers only, such as Safari (including iPad) and Chrome.

~~Go try it out: the [hosted version](http://plainreader.com) is now online!~~

## Features

1. Simple list of unread items from NewsBlur's River of News
2. One-click to send to Instapaper
3. Pinboard integration ('popup with tags' & 'read later')
4. Full article mode using [Instapaper's text engine](http://www.instapaper.com/extras) (just click the article title)
5. 20px Georgia article font
6. Keyboard shortcuts: up/down arrows to flip through articles, enter for full article mode (see above), spacebar to smoothly scroll articles
7. Preview links and footnotes in a Lion-style popover

## Screenshot (iPad)
![screenshot](https://github.com/lhagan/PlainReader/raw/master/plainreader_screenshot.jpg)

## Why?

I started building PlainReader out of a desire for a simple, minimal RSS reading experience akin to that of Silvio Rizzi's [Reeder](http://reederapp.com),[^1] but in a web browser (and using NewsBlur instead of Google Reader). The goal is a single webapp that works equally well on my 11" MacBook Air and iPad 1. If you have a bigger or smaller screen, well, your mileage may vary. It's also not intended to be a replacement for the default NewsBlur interface -- PlainReader will never reach feature parity with NewsBlur's web UI, that's not the point.

## How?

PlainReader consists of a web (HTML5, CSS3, Javascript) front-end and an intermediary server that proxies NewsBlur to get around cross-domain restrictions and strip down the data transferred to just what's needed. Some acknowledgements:

* [NewsBlur](http://newsblur.com): web-based RSS reader (think Google Reader, but better), does all the actual work fetching feeds and such.
* [Zepto](http://zeptojs.com/): minimalist JavaScript framework with jQuery syntax, specifically designed for mobile WebKit.
* [Instapaper](http://www.instapaper.com): text engine provides cleaned up article content to minimize loading times (and advertising).
* [HTML5 Boilerplate](http://html5boilerplate.com/): HTML/CSS/JS template.
* [HTML5 Boilerplate Ant Build Script](https://github.com/h5bp/ant-build-script): minify, concatenate, and gzip.
* [Iconic](http://somerandomdude.com/work/iconic/): free, minimal icons distributed (among other things) in OTF font format, allowing PlainReader's interface to get by without a single image.
* [nginx](http://wiki.nginx.org/Main): HTTP server that proxies NewsBlur.

## Usage

The easiest way to use PlainReader is via the [hosted version](http://plainreader.com). However, if you want to run your own instance or make modifications, here are some instructions:

* The hosted version is minified, gzipped, etc. by the HTML5 Boilerplate ant build script. To build the yourself site, you'll need [Apache Ant](http://ant.apache.org). Then, just run `ant build` from within the `build` folder. _This is optional._

* PlainReader depends upon the web server nginx to proxy NewsBlur and Instapaper. Unfortunately, not just any nginx will do -- you also need the Lua module. If you're on a Mac, use [these instructions](https://gist.github.com/jugyo/3882497). Other platforms should be similar.

* Once you have nginx installed, modify the `nginx.conf` at the root of this repo to match the path to PlainReader on your system (see lines 72 and 105). Then run nginx using that config file (`nginx -c nginx.conf`). This will host a local instance of the PlainReader source at http://localhost:8000 and the compiled version at http://localhost:8001.

## What's next?

1. interface additions/refinements:
    * feed favicons & intelligence classifiers in story list
2. reimplement 'mark all as read' button
3. intelligence tag buttons in the article header
4. offline storage
5. mark as read/unread button

I don't plan on ever supporting:

* changing the Intelligence filter mode (only yellow and green items are displayed)
* non-WebKit browsers
* mobile phones
* reading individual feeds (instead of the River of News)
* social anything (unless you count pinboard)
* realtime updates (PubSubHubbub)

That said, I'll consider patches / pull requests on any of these if you figure out how to implement them without adding a bunch of complexity or cluttering up the interface.

[^1]: the UI is presently a brazen copy of Reeder for iPad, albeit with lots fewer features and no textures or gradients. File this under 'imitation is the sincerest form of flattery.'
