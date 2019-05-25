'use strict';

function eventRoutes(express, controller) {
	const router = express.Router();

	/// EVENT ROUTES ///

	// GET request for creating a Event. NOTE This must come before routes that display Event (uses id).
	router.get('/create', controller.create_get);

	// POST request for creating Event.
	router.post('/create', controller.create_post);

	return router;
}

module.exports = eventRoutes;
