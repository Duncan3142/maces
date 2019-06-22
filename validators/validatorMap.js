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
	for (const [name, middlewares] of sets.entries()) {
		validatorSetMap.set(name, middlewares);
	}
}

function validator(validators) {
	const validatorMap = new Map();
	const validatorSetMap = new Map();
	insertValidators(validators, validatorMap, validatorSetMap);

	return {
		get: validatorMap.get,
		getSet: validatorSetMap.get
	};
}

module.exports = validator;
