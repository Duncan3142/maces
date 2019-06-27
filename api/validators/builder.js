'use strict';

function builder(buildCheckFunction, validatorMap) {
	return function (builderFn) {
		return (builderFn(buildCheckFunction, validatorMap));
	};
}

module.exports = builder;
