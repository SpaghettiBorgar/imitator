const Discord = require("discord.js");
global.client = new Discord.Client();
global.config = require("./config.json");

const cache = require("./Cache");
const msgfetcher = require("./MessageFetcher");
const analyzer = require("./Analyzer");
const synthesizer = require("./Synthesizer");
const channels = require("./ChannelManager");
const status = require("./Status");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}`)
});
debugger;
client.on("message", msg => {
	if(msg.content.startsWith(config.prefix)) {
		args = msg.content.substr(config.prefix.length).split(' ');
		switch(args[0])
		{
			case "fetch":
				msgfetcher.fetch(msg, args);
				break;
			case "compile":
				analyzer.compile(msg, args);
				break;
			case "synthesize":
			case "synth":
				synthesizer.generate(msg, args);
				break;
			case "webhook":
				channels.setup(msg, args);
				break;
			case "user":
				channels.user(msg, args);
				break;
			case "status":
				status.status(msg, args);
			//case "help":
			//	msg.channel.send();
			//	break;
		}
	}
});

client.login(config.token);