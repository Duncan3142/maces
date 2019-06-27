'use strict';

function authenticator(passwordAuth) {
	return function (admin, password) {
		return passwordAuth(admin).validate(password);
	};
}

function serializeUser(user, done) {
	done(null, user.id);
}

function deserializeUser(adminService) {
	return function (id, done) {
		adminService.fetch({ field: 'id', value: id })
			.then(admin => done(null, admin ? admin : false))
			.catch(done);
	};
}

function enableLocalAuth(LocalStrategy, passwordAuth, adminService) {
	return function(passport) {
		const auth = authenticator(passwordAuth);
		passport.use(new LocalStrategy(
			(username, password, done) => {
				adminService.fetch({ key: 'email', value: username })
					.then(async (admin) => {
						return (admin && await auth(admin, password)) ? done(null, admin) : done(null, false, { errors: { 'email or password': 'is invalid' } });
					})
					.catch(done);
			}
		));
		passport.serializeUser(serializeUser);
		passport.deserializeUser(deserializeUser(adminService));
		return passport;
	};
}

function strategy(LocalStrategy, passwordAuth, adminService) {
	return enableLocalAuth(LocalStrategy, passwordAuth, adminService);
}

module.exports = strategy;
