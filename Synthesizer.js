const cache = require("./Cache");
const memberparser = require("./MemberParser");

function randomdist(prob, count) {
	let rand = Math.random();
	let acc = 0;
	count++;

	for(key in prob) {
		let val = prob[key];
		if(key == '\0') {
			val *= 1 - (1 / Math.exp(count / 12));
		}
		acc += val;
		prob[key] = acc;
	}
	rand *= acc;

	for(key in prob) {
		if(rand < prob[key])
			return key;
	}

}

exports.send = async function(member, channel, text) {
	channeldata = JSON.parse(await cache.get(`data/channels/${channel.id}.json`));
	(await channel.fetchWebhooks()).get(channeldata.webhook).send(`${channeldata[member.id] || ""} ${text}`, {
		username: member.displayName,
		avatarURL: member.user.avatarURL()
	});
}

exports.generate = async function(msg, args) {
	let user = memberparser.member(args[1], msg.guild);
	if(!user)
		return msg.channel.send("Specify a user");

	let stat;
	try {
		stat = JSON.parse(await cache.get(`data/compiled/${msg.channel.id}/${user.id}.json`));
	} catch(e) {
		return msg.channel.send(`There exists no vocabulary for user ${user.user.username}`);
	}
	
	let count = 0;
	let last = '\0';
	let text = "";
	
	debugger;
	if(args[2]) {
		text = args.splice(2).join(' ');
		last = text.split(' ').pop();
		if(!stat[last])
			return msg.channel.send(`There are no candidates for "${last}"`)
		count = text.split(' ').length;
	}

	while((last = randomdist(stat[last], count)) != '\0') {
		text += ' ' + last;
		count++;
		if(count > 60)
			break;
	}
	exports.send(user, msg.channel, text);
}
