'use strict';

function eventRoutes(express, controller) {
	const router = express.Router();

	/// EVENT ROUTES ///

	// GET catalog home page.
	router.get('/', controller.event_list);

	// GET request for creating a Event. NOTE This must come before routes that display Event (uses id).
	router.get('/create', controller.event_create_get);

	// POST request for creating Event.
	router.post('/create', controller.event_create_post);

	// GET request to delete Event.
	router.get('/:id/delete', controller.event_delete_get);

	// POST request to delete Event.
	router.post('/:id/delete', controller.event_delete_post);

	// GET request to update Event.
	router.get('/:id/update', controller.event_update_get);

	// POST request to update Event.
	router.post('/:id/update', controller.event_update_post);

	// GET request for one Event.
	router.get('/:id', controller.event_detail);

	return router;
}


module.exports = eventRoutes;
