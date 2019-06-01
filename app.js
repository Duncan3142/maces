'use strict';

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//Set up pg connection
const fs = require('fs');
const dbConfig = require('./db/connection');
const knex = require('knex')({
	client: 'pg',
	connection: dbConfig
});

const objection = require('objection');
const Model = objection.Model;
Model.knex(knex);

function JSONConfig(path) {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const modelConfig = JSONConfig('./models/models.json');
const mimeTypesConfig = JSONConfig('./models/mimeTypes.json');

const modelRegistry = new Map();

const BaseModel = require('./models/base')(Model, modelRegistry, require('./models/validator')(objection.AjvValidator));

for (let model of modelConfig.models) {
	modelRegistry.set(model, require(`./models/${model}`)(BaseModel));
}

const { body, param, buildCheckFunction, validationResult } = require('express-validator/check');
const { sanitizeBody, sanitizeParam, buildSanitizeFunction } = require('express-validator/filter');

const multer = require('multer');

const bodyValidator = require('./validators/body')(body, sanitizeBody);
const paramValidator = require('./validators/param')(param, sanitizeParam);
const fileValidator = require('./validators/file')(buildCheckFunction, buildSanitizeFunction, require('file-type'));

const indexController = require('./controllers/index')(modelRegistry);
const indexRouter = require('./routes/index')(express, indexController);

const eventCreate = require('./controllers/event/create')({body: bodyValidator, result: validationResult}, modelRegistry, mimeTypesConfig);
const eventList = require('./controllers/event/list')(modelRegistry);
const eventRemove = require('./controllers/event/remove')(modelRegistry, {param: paramValidator, result: validationResult});
const eventController = require('./controllers/event/index')(eventList, eventCreate, eventRemove);
const eventRouter = require('./routes/event')(express, eventController);

const mediaCreate = require('./controllers/media/create')(multer, {body: bodyValidator, file: fileValidator, result: validationResult}, modelRegistry, mimeTypesConfig);
const mediaList = require('./controllers/media/list')(modelRegistry);
const mediaRemove = require('./controllers/media/remove')(modelRegistry, {param: paramValidator, result: validationResult});
const mediaController = require('./controllers/media/index')(mediaList, mediaCreate, mediaRemove);
const mediaRouter = require('./routes/media')(express, mediaController);

const adminRouter = require('./routes/admin')(express, {event: eventRouter, media: mediaRouter});

const app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', './views');
app.set('view engine', 'pug');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('./public'));

// routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// error handlers
const errorHandlers = require('./controllers/error')(createError);
app.use(errorHandlers);

module.exports = app;
