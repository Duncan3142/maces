'use strict';

function getModel(modelRegistry) {
	return function(modelName) {
		return modelRegistry.get(modelName);
	};
}

function startTransaction(knex, transaction) {
	return function() {
		return transaction.start(knex);
	};
}

function database(modelRegistry, knex, transaction) {
	return {
		getModel: getModel(modelRegistry),
		startTransaction: startTransaction(knex, transaction)
	};
}

module.exports = database;
