'use strict';

function setTrueType(typeChecker) {
	return (value, { req }) => {
		const file = req.file;
		return file ? typeChecker(file.buffer).mime : value;
	};
}

function validator(buildCheckFunction, buildSanitizeFunction, typeChecker) {
	return {
		check: buildCheckFunction(['file']),
		filter: buildSanitizeFunction(['file']),
		setType: setTrueType(typeChecker)
	};
}

module.exports = validator;
