'use strict';

function router(express, routes) {

	const router = express.Router();

	router.use('/event', routes.event);

	router.use('/media', routes.media);

	return router;
}

module.exports = router;
