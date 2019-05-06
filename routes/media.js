'use strict';

function mediaRouter(express, controller) {
	const router = express.Router();

	/// Media ROUTES ///

	router.get('/', controller.media_list);

	// GET request for creating media. NOTE This must come before route for id (i.e. display media).
	router.get('/create', controller.media_create_get);

	// POST request for creating media.
	router.post('/create', controller.media_create_post);

	// GET request to delete media.
	router.get('/:id/delete', controller.media_delete_get);

	// POST request to delete media.
	router.post('/:id/delete', controller.media_delete_post);

	// GET request for one media.
	router.get('/:id', controller.media_detail);

	return router;
}

module.exports = mediaRouter;
