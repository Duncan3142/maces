function authenticator(adminAuth) {
	return function (admin, password) {
		return admin ? adminAuth(admin).validatePassword(password) : false;
	};
}

function serializeUser(user, done) {
	done(null, user.id);
}

function deserializeUser(adminQueries) {
	return function (id, done) {
		adminQueries.fetch({ field: 'id', value: id })
			.then(admin => done(null, admin))
			.catch(done);
	};
}

function config(LocalStrategy, passport, adminAuth, adminQueries) {
	const auth = authenticator(adminAuth);
	passport.use(new LocalStrategy(
		(username, password, done) => {
			adminQueries.fetch({ field: 'email', value: username })
				.then(async (admin) => {
					return (await auth(admin, password)) ? done(null, admin) : done(null, false, { errors: { 'email or password': 'is invalid' } });
				})
				.catch(done);
		}
	));
	passport.serializeUser(serializeUser);
	passport.deserializeUser(deserializeUser(adminQueries));
}

function controller(LocalStrategy, passport, adminAuth, adminQueries) {
	return {
		config: config(LocalStrategy, passport, adminAuth, adminQueries)
	};
}

module.exports = controller;
