Node.js IRC Bot with plugins capabilities
===

### To run:

Simple as:
	
	node archibolt.js

### Configuration:

Everything you need to customize is located in config.js. It looks like this:

	exports.config = {
	  host: 'some_host',
	  port: a_port,
	  user: 'ArchiBolt', // you can change it if you don't like the name
	  channel: '#the_channel_you_want_the_bot_in',
	  pluginsDir: 'plugins' // place of the plugins folder
	};


### Plugins:

Every plugin should be placed inside the pluginsDir (specified in config.js). The name of the folder should be
the same as the plugin file name (ie random/random.js).

To create a plugin you simply have to create a class called "BotPlugin" with methods for an action you want to use.
Possible actions:

	- join (BotPlugin.prototype.join = ...) -- called when the bot joins a channel; received param: user
	- part -- called when a bot leaves a channel; received param: user
	- disconnect -- called when the bot gets disconnected; received param: user
	- privmsg -- called when the bot receives a message (on the channel or on priv); received params: prefix, channel, text, user

Check the existing plugins for a more detailed example :) . 

### Other credits:

The IRC client class I've used is made by Tim-Smart and can be found [here](https://github.com/Tim-Smart/node-ircbot-framework). 
