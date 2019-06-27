'use strict';

function JSONConfig(fs) {
	return function (path) {
		return JSON.parse(fs.readFileSync(path, 'utf8'));
	};
}

module.exports = JSONConfig;
