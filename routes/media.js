'use strict';

function mediaRouter(express, controller) {
	const router = express.Router();

	/// Media ROUTES ///

	router.get('/', controller.list);

	// GET request for creating media. NOTE This must come before route for id (i.e. display media).
	router.get('/create', controller.create_get);

	// POST request for creating media.
	router.post('/create', controller.create_post);

	return router;
}

module.exports = mediaRouter;
