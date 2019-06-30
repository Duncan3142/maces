'use strict';

const userController = require('./controllers/user');
const adminController = require('./controllers/admin');

const routeBuilderFactory = require('./routeBuilder');

const path = require('path');

function app(express, isLoggedIn) {
	const app = express();
	// static files
	app.use(express.static(path.join(__dirname, 'public')));
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'pug');

	const routeBuilder = routeBuilderFactory(isLoggedIn);

	const userRouter = routeBuilder(express.Router(), userController());
	app.use('/', userRouter);

	const adminRouter = routeBuilder(express.Router(), adminController());
	app.use('/admin', adminRouter);

	return app;
}

module.exports = app;
