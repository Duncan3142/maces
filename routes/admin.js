'use strict';

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/login');
	}
}

function router(express, controller, routes) {

	const router = express.Router();

	router.use(isLoggedIn);

	router.get('/', controller.index);

	router.use('/event', routes.event);

	router.use('/media', routes.media);

	return router;
}

module.exports = router;
