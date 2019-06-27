'use strict';

function fileHash(crypto) {
	return function(buffer) {
		return crypto.createHash('md5').update(buffer).digest('hex');
	};
}

module.exports = fileHash;
