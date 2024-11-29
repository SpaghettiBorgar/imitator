const fs = require("fs");
const fspath = require("path");

var cache = {};

exports.get = function(path) {
	return new Promise(function(res, rej) {
		if(cache[path]) {
			res(cache[path]);
		} else {
			fs.readFile(path, (err, data) => {
				if(err)
					rej(err);
				else
					res(data);
			});
		}
	});
}

exports.write = function(path, data) {
	return new Promise(function(res, rej) {
		cache[path] = data;
		fs.mkdir(fspath.dirname(path), {recursive: true}, err => {
			if(err)
				rej(err);

			fs.writeFile(path, data, err => {
				if(err)
					rej(err);
				else
					res();
			});
		});
	});
}