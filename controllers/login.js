function get() {
	return function(req, res) {
		res.render('login', { title: 'Login' });
	};
}

function post(passport) {
	return passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' });
}

function controller(passport) {
	return {
		get: get(),
		post: post(passport)
	};
}

module.exports = controller;
