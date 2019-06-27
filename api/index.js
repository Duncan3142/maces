'use strict';

const mediaServiceFactory = require('./services/media');
const eventServiceFactory = require('./services/event');

const eventControllerFactory = require('./controllers/event');
const mediaControllerFactory = require('./controllers/media');

const validatorMapFactory = require('./validators/map');

const routeBuilderFactory = require('./routeBuilder');

const { buildCheckFunction, validationResult, matchedData } = require('express-validator');

const multer = require('multer');
const fileType = require('file-type');
const crypto = require('crypto');
const filehashFactory = require('./utils/filehash');
const mimetypeFactory = require('./utils/mimetype');

const filehash = filehashFactory(crypto);
const mimetype = mimetypeFactory(fileType);

function api(express, database, isLoggedIn, mimeTypesConfig) {
	const api = express();

	api.use(express.json());
	api.use(express.urlencoded({ extended: false }));

	const mediaService = mediaServiceFactory(database, mimeTypesConfig);
	const eventService = eventServiceFactory(database);

	const eventController = eventControllerFactory(mediaService, eventService);
	const mediaController = mediaControllerFactory(mediaService, multer, mimetype, filehash);

	const validatorMap = validatorMapFactory(buildCheckFunction);

	const routeBuilder = routeBuilderFactory(validatorMap, validationResult, matchedData, isLoggedIn);

	const eventRouter = routeBuilder(express.Router(), eventController);
	api.use('/events', eventRouter);

	const mediaRouter = routeBuilder(express.Router(), mediaController);
	api.use('/media', mediaRouter);

	return api;
}

module.exports = api;
