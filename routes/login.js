'use strict';

function router(express, controller) {

	const router = express.Router();

	router.get('/', controller.get);

	router.post('/', controller.post);

	return router;
}

module.exports = router;
