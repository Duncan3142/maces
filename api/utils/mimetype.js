'use strict';

function mimetype(typeChecker) {
	return (file) => {
		return typeChecker(file).mime;
	};
}

module.exports = mimetype;
