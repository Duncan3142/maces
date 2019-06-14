'use strict';

function indexRouter(express, controller) {
	const router = express.Router();

	// Home page
	router.get('/', controller.index);

	router.get('/about', controller.about);

	router.get('/history', controller.history);

	router.get('/thanks', controller.thanks);

	return router;
}

module.exports = indexRouter;
