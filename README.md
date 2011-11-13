# PlainReader

PlainReader (working title) is a proof of concept web-based client for the excellent [NewsBlur](http://newsblur.com) RSS reader. It's currently in a very early alpha state, so don't expect it to replace your current news reader any time soon.

## Features

1. Simple list of unread items from NewsBlur's River of News
2. Instapaper and Pinboard integration
3. Full article mode using [Instapaper's text engine](http://www.instapaper.com/extras) (click the article title)
4. 20px Georgia article font

## Why

I started building PlainReader out of a desire for a simple, minimal RSS reading experience akin to that of Silvio Rizzi's [Reeder](http://reederapp.com),[^1] but in a web browser. The goal is a single webapp that works equally well on my 11" MacBook Air and iPad 1. If you have a bigger or smaller screen, well, your mileage may vary. It's also not intended to be a replacement for the default NewsBlur interface -- PlainReader will never reach feature parity with NewsBlur, that's not the point.

## How

PlainReader consists of a web (HTML5, CSS3, Javascript) front-end and an intermediary server that proxies NewsBlur to get around cross-domain restrictions and strip down the data transferred to just what's needed. Some acknowledgements:

* [NewsBlur](http://newsblur.com): web-based RSS reader (think Google Reader, but better), does all the actual work fetching feeds and such.
* [Bottle](http://bottlepy.org/docs/dev/): Python micro web framework -- talks to NewsBlur and serves up PlainReader.
* [Zepto](http://zeptojs.com/): minimalist JavaScript framework with jQuery syntax, specifically designed for mobile WebKit.
* [Instapaper](http://www.instapaper.com): text engine provides cleaned up article content to minimize loading times (and advertising).
* [HTML5 Boilerplate](http://html5boilerplate.com/): HTML/CSS/JS template.
* [Iconic](http://somerandomdude.com/work/iconic/): free, minimal icons distributed (among other things) in OTF font format, allowing PlainReader's interface to get by without a single image.

## Usage

It's completely self-contained, so just run `python serv.py` and point your browser at [http://localhost:8181](http://localhost:8181).

**Important:** don't run PlainReader on a computer/server that's open to the internet or on an untrusted LAN. If your computer isn't firewalled, anyone on your network can access your feeds while you're logged in.

## Roadmap

1. stop managing data in the DOM (or at least clean it up)
2. fix mark as read functionality
3. interface additions/refinements:
    * unread count (with intelligence breakdown)
    * scroll story list to keep the currently selected item in the middle (where possible)
    * feed favicons & intelligence classifiers in story list
4. 'mark all as read' button
5. intelligence panel

I don't plan on ever supporting:

* changing the Intelligence filter mode (only yellow and green items are displayed)
* non-WebKit browsers
* iPhone, or anything else smaller than an iPad
* reading individual feeds (instead of the River of News)
* social anything

That said, I'll consider patches / pull requests on any of these if you figure out how to implement them without adding a bunch of complexity or cluttering up the interface.

[^1]: the UI is presently a brazen copy of Reeder for iPad, albeit with lots fewer features and no textures or gradients. File this under 'imitation is the sincerest form of flattery.'
