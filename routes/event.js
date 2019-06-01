'use strict';

function eventRoutes(express, controller) {
	const router = express.Router();

	/// EVENT ROUTES ///

	router.get('/', controller.list);

	// GET request for creating a Event. NOTE This must come before routes that display Event (uses id).
	router.get('/create', controller.create_get);

	// POST request for creating Event.
	router.post('/create', controller.create_post);

	// POST request for deleting media.
	router.post('/:id/delete', controller.remove);

	return router;
}

module.exports = eventRoutes;
