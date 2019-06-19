'use strict';

function mediaRouter(express, controller) {
	const router = express.Router();

	/// Media ROUTES ///

	router.get('/', controller.list);

	// GET request for creating media. NOTE This must come before routes using params.
	router.get('/create', controller.create_get);

	// POST request for creating media.
	router.post('/create', controller.create_post);

	// POST request for deleting media.
	router.post('/:id/delete', controller.remove);

	// GET request for updating media.
	router.get('/:id/update', controller.update_get);

	// POST request for updating media.
	router.post('/:id/update', controller.update_post);

	return router;
}

module.exports = mediaRouter;
