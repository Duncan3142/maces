function authenticator(passwordAuth) {
	return function (admin, password) {
		return passwordAuth(admin).validate(password);
	};
}

function serializeUser(user, done) {
	done(null, user.id);
}

function deserializeUser(adminQueries) {
	return function (id, done) {
		adminQueries.fetch({ field: 'id', value: id })
			.then(admin => done(null, admin ? admin : false))
			.catch(done);
	};
}

function enableLocalAuth(LocalStrategy, passwordAuth, adminQueries) {
	return function(passport) {
		const auth = authenticator(passwordAuth);
		passport.use(new LocalStrategy(
			(username, password, done) => {
				adminQueries.fetch({ field: 'email', value: username })
					.then(async (admin) => {
						return (admin && await auth(admin, password)) ? done(null, admin) : done(null, false, { errors: { 'email or password': 'is invalid' } });
					})
					.catch(done);
			}
		));
		passport.serializeUser(serializeUser);
		passport.deserializeUser(deserializeUser(adminQueries));
		return passport;
	};
}

function strategy(LocalStrategy, passwordAuth, adminQueries) {
	return enableLocalAuth(LocalStrategy, passwordAuth, adminQueries);
}

module.exports = strategy;
