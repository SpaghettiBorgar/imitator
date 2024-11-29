const fs = require("fs");
const cache = require("./Cache");
const memberparser = require("./MemberParser");
const { parse } = require("fast-csv");

function filter(text) {
	return text.replace(/\n/g, "").split(' ').filter(e => {
		return e.length > 0 && !e.startsWith('!') && !e.match(/(?<!\\)(?<=<@!?)\d{17,18}(?=>)/) && !e.match(/(?<!\\)<a?:\w{2,32}:\d{18}>/) 
			&& !e.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/); //regex by @stephenhay
	});
}

function analyze(samples) {
	samples = samples.filter(e => !e.startsWith('!')).map(e => filter(e.toLowerCase())).filter(e => e.length > 0);
	
	stat = {};
	for(sample of samples) {
		for(let i = -1; i < sample.length; i++) {
			let word = sample[i] || '\0';
			let next = sample[i + 1] || '\0';
			if(!stat[word])
				stat[word] = {};
			stat[word][next] = ++stat[word][next] || 1;
		}
	}

	for(key in stat) {
		let word = stat[key];
		let sum = 0;
		for(next in word) {
			sum += word[next];
		}
		for(next in word) {
			word[next] /= sum;
		}
	}

	return stat;
}

exports.compile = function(msg, args) {
	let user = memberparser.member(args[1], msg.guild);
	let samples = [];
	let csvstream = parse({headers: false})
		.on("error", err => console.error(err))
		.on("data", row => {
			if(row[1] == user)
				samples.push(row[3]);
		})
		.on("end", count => {
			let stat = analyze(samples);
			msg.channel.send(`Learned ${Object.keys(stat).length - 1} words from ${samples.length} messages for user ${user.displayName}`)
			cache.write(`data/compiled/${msg.channel.id}/${user.id}.json`, JSON.stringify(stat));
		});
	let filestream = fs.createReadStream(`data/fetched/${msg.channel.id}.csv`);
	filestream.pipe(csvstream);
}
