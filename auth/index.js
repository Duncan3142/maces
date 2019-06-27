'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const passwordAuthFactory = require('./services/passwordAuth');
const authStrategyFactory = require('./services/localStrategy');
const adminServiceFactory = require('./services/admin');
const bcrypt = require('bcrypt');
const isLoggedIn = require('./controllers/isLoggedIn');

function auth(express, db, session) {
	const auth = express();

	const adminService = adminServiceFactory(db);

	const passwordAuth = passwordAuthFactory(bcrypt);
	const enableLocalAuth = authStrategyFactory(LocalStrategy, passwordAuth, adminService);

	enableLocalAuth(passport);

	auth.use(session({ secret: process.env.SESSION_SECRET, cookie: { maxAge: 60 * 60 * 1000 }, resave: false, saveUninitialized: false, store: db.sessionStore }));
	auth.use(passport.initialize());
	auth.use(passport.session());
	auth.post('/auth', passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' }));
	auth.isLoggedIn = isLoggedIn;
	return auth;
}

module.exports = auth;
