# PlainReader

PlainReader (working title) is a clean, minimal web-based client for the excellent [NewsBlur](http://newsblur.com) RSS reader. It's still in an **early beta** state with only the bare minimum of features to work as a functional news reader.

## Features

1. Simple list of unread items from NewsBlur's River of News
2. Instapaper and Pinboard integration
3. Full article mode using [Instapaper's text engine](http://www.instapaper.com/extras) (click the article title)
4. 20px Georgia article font
5. Keyboard shortcuts: up/down arrows to flip through articles, enter for full article mode (see above)

## Screenshot (iPad)
![screenshot](https://github.com/lhagan/PlainReader/raw/master/plainreader_screenshot.jpg)

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
* [Beautiful Soup](http://www.crummy.com/software/BeautifulSoup/): Python HTML/XML parser.

## Usage

Starting PlainReader runs a local web server that hosts the PlainReader webapp. Once the server is running, just access PlainReader in your browser at [http://localhost:8181](http://localhost:8181). If you aren't running a firewall (or if you configure your firewall to allow HTTP connections to port 8181), you can access PlainReader from any computer (or iOS device) on your local network using your computer's IP address or Bonjour name.

**Mac users**: just [download the Mac App](https://github.com/downloads/lhagan/PlainReader/PlainReader.zip)!

**Everyone else**: PlainReader's only dependency is Python, so just run grab the source code, run `python serv.py` in your terminal and point your browser at [http://localhost:8181](http://localhost:8181). Note that PlainReader may not work on Windows, but fixing this is in the plan.

**IMPORTANT:** don't run PlainReader on a computer/server that's open to the internet or on an untrusted LAN. If your computer isn't firewalled, anyone on your network can access your feeds while you're logged in.

## Roadmap

1. stop managing data in the DOM (or at least clean it up)
2. <del>enable mark as read on a per item basis (currently, only mark all as read is enabled)</del>
3. interface additions/refinements:
    * <del>unread count</del> (with intelligence breakdown)
    * <del>scroll story list to keep the currently selected item in the middle (where possible)</del>
    * feed favicons & intelligence classifiers in story list
4. <del>'mark all as read' button</del>
5. intelligence <del>panel</del> tag buttons in the article header
6. load multiple 'pages' of unread items (currently, you have to hit refresh feeds once you get to the bottom of the list)
7. Windows support

I don't plan on ever supporting:

* changing the Intelligence filter mode (only yellow and green items are displayed)
* non-WebKit browsers
* <del>iPhone, or anything else smaller than an iPad</del> OK, maybe there'll be an iPhone version eventually
* reading individual feeds (instead of the River of News)
* social anything (unless you count pinboard)

That said, I'll consider patches / pull requests on any of these if you figure out how to implement them without adding a bunch of complexity or cluttering up the interface.

[^1]: the UI is presently a brazen copy of Reeder for iPad, albeit with lots fewer features and no textures or gradients. File this under 'imitation is the sincerest form of flattery.'
