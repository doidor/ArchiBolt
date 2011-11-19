var url = require('url'),
	http = require('http'),
	events = require('events');

function BotPlugin (obj) {
	this.name = "PulpFictionQuotes";
	this.creator = "Tudor Popa";
	this.description = "post random quotes from 'Pulp Fiction', the movie. (the quotes are fetched from pulpfictionquot twitter account)"

	this.obj = obj;

	this.client = this.obj.client;
	this.config = this.obj.config;

	this.currentQuotes = new Array();
	this.quotesInitiated = false;

	this.quoteUpdateInterval = 1000 * 60 * 120; // 2 hours in milliseconds
	this.postUpdateInterval = 1000 * 30 * 10; // 30 mins in milliseconds

	this.quoteInterval = null;
	this.postInterval = null;

	this.eventEmitter = new events.EventEmitter();

	this.lastQuote = 99999;
	this.randomizeQuote = true;

	this.disabled = true;
}

BotPlugin.prototype.initiateQuotes = function () {
	var that = this;

	var req = http.get({
		host: 'api.twitter.com',
		port: 80,
		path: "/1/statuses/user_timeline.json?screen_name=pulpfictionquot&count=100"
	}, function(res) {
		var ret = "";
		res.on('data', function (c) {
			ret += c;
		});

		res.on('end', function() {
			ret = eval(ret);

			for (var i in ret) {
				var text = ret[i];
				that.currentQuotes.push(text.text);
			}

			that.quotesInitiated = true;

			console.log("Fetched quotes!");

			that.eventEmitter.emit("finishedFetching");			
		});
	});
}

BotPlugin.prototype.fetchNewQuotes = function () {
	var that = this;

	var req = http.get({
		host: 'api.twitter.com',
		port: 80,
		path: "/1/statuses/user_timeline.json?screen_name=pulpfictionquot&count=1"
	}, function(res) {
		var ret = "";
		res.on('data', function (c) {
			ret += c;
		});

		res.on('end', function() {
			ret = eval(ret);
			var text = ret[0].text;

			if (!(text in that.currentQuotes)) {
				that.currentQuotes.push(text);
			}
		});
	});	
}

BotPlugin.prototype.postQuote = function () {
	console.log("Posting!");

	if (this.randomizeQuote) {
		this.lastQuote = Math.floor(Math.random() * this.currentQuotes.length);
		this.randomizeQuote = false;
	}

	var quote = (this.lastQuote >= 0) ? this.currentQuotes[this.lastQuote] : false;

	if (quote) {
		this.client.send("PRIVMSG", this.config.channel, ":" + quote);
		this.lastQuote--;
	}
	else {
		this.lastQuote = Math.floor(Math.random() * this.currentQuotes.length);
	}	
}

BotPlugin.prototype.start = function () {
	var that = this;
	console.log("Started posting quotes!");

	this.eventEmitter.on("finishedFetching", function () {
		if (that.quotesInitiated) {
			that.postQuote();

			that.postInterval = setInterval(function () {
				that.postQuote();
			}, that.postUpdateInterval);

			that.quoteInterval = setInterval(function () {
				that.fetchNewQuotes();
			}, that.quoteUpdateInterval);
		}
	});

	this.initiateQuotes();
}

BotPlugin.prototype.join = function (user) {
	if (user == this.config.user) {
		this.start();
	}
}

module.exports = BotPlugin;