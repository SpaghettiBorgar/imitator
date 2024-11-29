const fs = require("fs");
const { parse } = require("fast-csv");
const bytesize = require("byte-size");
const cache = require("./Cache");

exports.status = async function(msg, args) {
	if(args[1] == "channel") {
		let channeldata = JSON.parse(await cache.get(`data/channels/${msg.channel.id}.json`));
		fs.stat(`data/fetched/${msg.channel.id}.csv`, (err, stat) => {
			if(err) {
				return msg.channel.send(err);
			}

			let messages = [];
			let csvstream = parse({headers: false})
			.on("error", err => console.error(err))
			.on("data", row => {
				messages.push([row[0], row[2]]);
			})
			.on("end", async count => {
				msg.channel.send({embed:{
					title: `Statistics for #${msg.channel.name}`,
					fields: [
						{
							name: "Webhook",
							value: channeldata.webhook || "No Webhook registered"
						}, {
							name: "Message Collection",
							value: `${messages.length} messages (${bytesize(stat.size)})`
						}, {
							name: "Updated on",
							value: stat.mtime.toLocaleString(),
							inline: true
						}, {
							name: "Earliest message",
							value: `[${(new Date(Number(messages[messages.length - 1][1]))).toLocaleDateString()}](${(await msg.channel.messages.fetch(messages[messages.length - 1][0])).url})`
						}, {
							name: "Newest message",
							value: `[${(new Date(Number(messages[0][1]))).toLocaleDateString()}](${(await msg.channel.messages.fetch(messages[0][0])).url})`
						}, {
							name: "Compiled Members",
							value: (await Promise.all(fs.readdirSync(`data/compiled/${msg.channel.id}`).filter(e => e != "webhook").map(e => msg.guild.members.fetch(e.split('.')[0])))).join('\n')
						}
					]
				}});
			});
			let fstream = fs.createReadStream(`data/fetched/${msg.channel.id}.csv`);
			fstream.pipe(csvstream);
		});
	} else if(args[1] == "user") {

	}
}