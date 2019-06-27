'use strict';

function insertValidators(validators, validatorMap, validatorSetMap) {
	const sets = {};
	for (const validator of validators) {
		const name = validator.name;
		const set = validator.set;
		const middleware = validator.middleware;
		if (set) {
			if (sets[set]) {
				sets[set].push(middleware);
			} else {
				sets[set] = [middleware];
			}
		}
		validatorMap.set(name, middleware);
	}
	for (const [name, middlewares] of Object.entries(sets)) {
		validatorSetMap.set(name, middlewares);
	}
}

function getFields(map) {
	return function (fields) {
		const result = [];
		for (const field of fields) {
			result.push(map.get(field));
		}
		return result;
	};
}

function validator(buildCheckFunction) {
	return function(validatorDefs) {
		const fieldMap = new Map();
		const setMap = new Map();
		insertValidators(validatorDefs(buildCheckFunction), fieldMap, setMap);

		return {
			getField: fieldMap.get,
			getFields: getFields(fieldMap),
			getSet: setMap.get
		};
	}
}

module.exports = validator;
