const fs = require("fs");
const { format } = require("fast-csv");

exports.fetch = async function(msg, args) {
	let count = Number(args[1]) || 100;
	let manager = msg.channel.messages;
	let path = `data/fetched/${msg.channel.id}.csv`;

	let filestream = fs.createWriteStream(`data/fetched/${msg.channel.id}.csv`);
	let csvstream = format();
	csvstream.pipe(filestream);
	let accumulated = 0;
	let lastMessage;
	
	while(accumulated < count) {
		let limit = Math.min(100, count - accumulated);
		let messages = await manager.fetch({limit: limit, before: lastMessage});
		messages.each(i => {
			csvstream.write([i.id, i.author.id, i.createdAt.getTime(), i.content]);
			lastMessage = i.id;
			accumulated++;
		});
		if(messages.size < limit) {
			console.log(`limit: ${limit}, got: ${messages.size}`);
			break;
		}
	}
	csvstream.end();
	filestream.end();
	msg.channel.send(`Accumulated ${accumulated} messages`);
}