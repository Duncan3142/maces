function setPassword(admin, crypto) {
	return function(password) {
		admin.salt = crypto.randomBytes(16).toString('hex');
		admin.hash = crypto.pbkdf2Sync(password, admin.salt, 10000, 512, 'sha512').toString('hex');
	};
}

function validatePassword(admin, crypto) {
	return function(password) {
		const hash = crypto.pbkdf2Sync(password, admin.salt, 10000, 512, 'sha512').toString('hex');
		return admin.hash === hash;
	};
}

function getAdmin(admin) {
	return function() {
		return admin;
	};
}

function controller(crypto) {
	return function(admin) {
		return {
			setPassword: setPassword(admin, crypto),
			validatePassword: validatePassword(admin, crypto),
			getAdmin: getAdmin(admin)
		};
	};
}

module.exports = controller;
