const FuseJS = require("fuse.js");

const mentionRegex = /(?<!\\)(?<=<@!?)\d{17,18}(?=>)/;
const idRegex = /\d{17,18}/;

exports.member = function(name, guild) {
	match = name.match(mentionRegex);
	if (match) {
		return guild.members.resolve(match[0]);
	} else if (name.match(idRegex)) {
		return guild.members.resolve(name);
	} else {
		let fuse = new FuseJS(guild.members.cache.array(), {
			shouldSort: true,
			threshold: 0.6,
			keys: ["displayName", "user.username"]
		});
		let res = fuse.search(name);
		if(res.length > 0)
			return res[0].item;
	}
}