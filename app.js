'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//Set up pg connection
const fs = require('fs');
const dbConfig = JSON.parse(fs.readFileSync(path.join(__dirname,'db/connection.json')));
const db = require('knex')({
	client: 'pg',
	connection: dbConfig,
	log: {
		error(message) {
			console.error(`Postgres error: ${message}`);
		}
	}
});

const objection = require('objection');
const Model = objection.Model;
Model.knex(db);

const models = new Map();

const modelConfig = JSON.parse(fs.readFileSync(path.join(__dirname,'models/models.json')));

const BaseModel = require('./models/base')(Model, models);

for (let model of modelConfig.models) {
	models.set(model, require(`./models/${model}`)(BaseModel));
}

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const multer = require('multer');

const indexController = require('./controllers')(models, objection.raw, objection.ref);
const indexRouter = require('./routes/index')(express, indexController);

const eventController = require('./controllers/event')(models);
const eventsRouter = require('./routes/event')(express, eventController);

const mediaController = require('./controllers/media')(models, body, validationResult, sanitizeBody, multer);
const mediaRouter = require('./routes/media')(express, mediaController);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/events', eventsRouter);
app.use('/media', mediaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
