'use strict';

function eventRoutes(express, controller) {
	const router = express.Router();

	/// EVENT ROUTES ///

	router.get('/', controller.list);

	// GET request for creating a Event. NOTE This must come before routes that use params.
	router.get('/create', controller.create_get);

	// POST request for creating event.
	router.post('/create', controller.create_post);

	// POST request for deleting event.
	router.post('/:id/delete', controller.remove);

	// GET request for updating event.
	router.get('/:id/update', controller.update_get);

	// POST request for updating event.
	router.post('/:id/update', controller.update_post);

	return router;
}

module.exports = eventRoutes;
