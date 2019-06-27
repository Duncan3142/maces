'use strict';

const createError = require('http-errors');
const express = require('express');
const session = require('express-session');

const logger = require('morgan');
const helmet = require('helmet');

const compression = require('compression');
const fs = require('fs');

const JSONConfigFactory = require('./config/json');

const errorHandlerFactory = require('./app/controllers/error');

const dbFactory = require('./db');
const authFactory = require('./auth');
const apiFactory = require('./api');
const appFactory = require('./app');

const JSONConfig = JSONConfigFactory(fs);
const mimeTypesConfig = JSONConfig('./config/mimeTypes.json');

const db = dbFactory(session);
const auth = authFactory(express, db, session);
const api = apiFactory(express, db, auth.isLoggedIn, mimeTypesConfig);
const app = appFactory(express, auth.isLoggedIn);

const server = express();

// security
server.use(helmet());

// logging
server.use(logger('dev'));

// compression
server.use(compression());

// routes
server.use(auth);
server.use('/', app);
server.use('/api', api);

// error handlers
// const errorHandler = errorHandlerFactory(createError);
// server.use(errorHandler);

module.exports = server;
