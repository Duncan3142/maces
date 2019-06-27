'use strict';

const dbConfig = require('./connection');

const knexFactory = require('knex');
const objection = require('objection');

const validatorFactory = require('./models/validator');

const macesModelFactory = require('./models/base');
const adminModelFactory = require('./models/admin');
const eventModelFactory = require('./models/event');
const mediaModelFactory = require('./models/media');
const eventDocumentModelFactory = require('./models/event_document');
const eventImageModelFactory = require('./models/event_image');

const KnexSessionStoreFactory = require('connect-session-knex');

function startTransaction(knex, transaction) {
	return function() {
		return transaction.start(knex);
	};
}

function registerModel(modelRegistry, model) {
	modelRegistry.set(model.tableName, model);
}



function database(session) {

	const knex = knexFactory(dbConfig);
	const ObjectionModel = objection.Model;
	ObjectionModel.knex(knex);

	const modelRegistry = new Map();

	const MacesModel = macesModelFactory(ObjectionModel, modelRegistry, validatorFactory(objection.AjvValidator));
	registerModel(modelRegistry, adminModelFactory(MacesModel));
	registerModel(modelRegistry, eventModelFactory(MacesModel));
	registerModel(modelRegistry, mediaModelFactory(MacesModel));
	registerModel(modelRegistry, eventDocumentModelFactory(MacesModel));
	registerModel(modelRegistry, eventImageModelFactory(MacesModel));

	const KnexSessionStore = KnexSessionStoreFactory(session);

	const sessionStore = new KnexSessionStore({
		knex: knex
	});

	return {
		getModel: modelRegistry.get.bind(modelRegistry),
		startTransaction: startTransaction(knex, objection.transaction),
		sessionStore: sessionStore
	};
}

module.exports = database;
