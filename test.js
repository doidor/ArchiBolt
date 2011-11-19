var url = require('url'),
	http = require('http');

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
		console.log(ret[0].text);

		for (var i in ret) {
			var text = ret[i];
			console.log(text.text);
		}
	});
});
