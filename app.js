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

const mapped = require('./utils/mapped');

const JSONConfig = require('./config/json')(fs, mapped);

const modelConfig = JSONConfig('./models/models.json');
const mimeTypesConfig = JSONConfig('./models/mimeTypes.json');

const modelRegistry = new Map();

const BaseModel = require('./models/base')(Model, modelRegistry, require('./models/validator')(objection.AjvValidator));

for (let model of modelConfig.models) {
	modelRegistry.set(model, require(`./models/${model}`)(BaseModel));
}

const database = require('./models/database')(modelRegistry, knex, objection.transaction);

const { body, param, buildCheckFunction, validationResult } = require('express-validator/check');
const { sanitizeBody, sanitizeParam, buildSanitizeFunction } = require('express-validator/filter');

const multer = require('multer');

const bodyValidator = require('./validators/body')(body, sanitizeBody);
const paramValidator = require('./validators/param')(param, sanitizeParam);
const fileValidator = require('./validators/file')(buildCheckFunction, buildSanitizeFunction, require('file-type'));

const indexController = require('./controllers/index')(database);
const indexRouter = require('./routes/index')(express, indexController);

const mediaQuery = require('./query/media')(database, mimeTypesConfig);
const eventQuery = require('./query/event')(database);

const eventUpsert = require('./controllers/event/upsert')({body: bodyValidator, result: validationResult}, {event: eventQuery, media: mediaQuery});
const eventCreate = require('./controllers/event/create')(eventUpsert, {media: mediaQuery});
const eventUpdate = require('./controllers/event/update')({param: paramValidator, result: validationResult}, eventUpsert, {event: eventQuery, media: mediaQuery});
const eventList = require('./controllers/event/list')({event: eventQuery});
const eventRemove = require('./controllers/event/remove')({param: paramValidator, result: validationResult}, {event: eventQuery});
const eventController = require('./controllers/event/index')(eventList, eventCreate, eventUpdate, eventRemove);
const eventRouter = require('./routes/event')(express, eventController);

const mediaCreate = require('./controllers/media/create')(multer, {body: bodyValidator, file: fileValidator, result: validationResult}, {media: mediaQuery}, mimeTypesConfig);
const mediaUpdate = require('./controllers/media/update')({param: paramValidator, body: bodyValidator, result: validationResult}, {media: mediaQuery});
const mediaList = require('./controllers/media/list')({media: mediaQuery});
const mediaRemove = require('./controllers/media/remove')({param: paramValidator, result: validationResult}, {media: mediaQuery});
const mediaController = require('./controllers/media/index')(mediaList, mediaCreate, mediaUpdate, mediaRemove);
const mediaRouter = require('./routes/media')(express, mediaController);

const adminRouter = require('./routes/admin')(express, {event: eventRouter, media: mediaRouter});

const app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', './views');
app.set('view engine', 'pug');
// allow absolute paths in pug templates
app.locals.basedir = app.get('views');

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
