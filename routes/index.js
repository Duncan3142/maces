'use strict';

function indexRouter(express, controller) {
	const router = express.Router();

	// Home page
	router.get('/', controller.index);

	return router;
}

module.exports = indexRouter;
