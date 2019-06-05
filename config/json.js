'use strict';

function JSONConfig(fs, mapped) {
	return function (path) {
		return mapped(JSON.parse(fs.readFileSync(path, 'utf8')));
	};
}

module.exports = JSONConfig;
