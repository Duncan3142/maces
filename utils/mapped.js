'use strict';

function map(mapFn) {
	const result = Object.keys(this).reduce(function(result, key) {
		result[key] = mapFn(this[key], key);
		return result;
	}, {});
	return mapped(result);
}

function mapped(obj) {
	obj.map = map;
	return obj;
}

module.exports = mapped;
