const memberparser = require("./MemberParser");
const fs = require("fs");
const cache = require("./Cache");

exports.setup = async function(msg, args) {
	if(args[1] == "create") {
		try {
			let webhook = await msg.channel.createWebhook("Imitator", {
				avatar: client.user.avatarURL(),
				reason: `Command issued by ${msg.author.tag}`
			});
			msg.channel.send("Webhook created");
			let channeldata;
			try {
				channeldata = JSON.parse(await cache.get(`data/channels/${msg.channel.id}.json`));
			} catch(e) {
				channeldata = {};
			}
			channeldata.webhook = webhook.id;
			cache.write(`data/channels/${msg.channel.id}.json`, JSON.stringify(channeldata));
		} catch(e) {
			console.error(e);
			msg.channel.send(e);
			return;
		}
	} else if(args[1] == "delete") {
		try {
			let channeldata = JSON.parse(await cache.get(`data/channels/${msg.channel.id}.json`));
			(await msg.channel.fetchWebhooks()).get(channeldata.webhook).delete();
			msg.channel.send("Deleted webhook associated with this channel");
		} catch(e) {
			msg.channel.send(e);
			return;
		}
	}
}

exports.user = async function(msg, args) {
	let member = memberparser.member(args[1], msg.guild);
	if(!member)
		return msg.channel.send("Must specify a valid member");

	let channeldata = JSON.parse(await cache.get(`data/channels/${msg.channel.id}.json`)) || {};
	let prefix = args[2] || "";
	channeldata[member.id] = prefix;
	msg.channel.send(prefix ? `Set prefix for user ${member.user.username} to ${prefix}` : `Removed prefix for user ${member.user.username}`);
	cache.write(`data/channels/${msg.channel.id}.json`, JSON.stringify(channeldata));
}