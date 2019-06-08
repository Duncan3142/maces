function setPassword(admin, bcrypt) {
	return async function(password) {
		const hash = await bcrypt.hash(password, 16);
		admin.hash = hash;
	};
}

function validatePassword(admin, bcrypt) {
	return async function(password) {
		return await bcrypt.compare(password, admin.hash);
	};
}

function controller(bcrypt) {
	return function(admin) {
		return {
			setPassword: setPassword(admin, bcrypt),
			validatePassword: validatePassword(admin, bcrypt)
		};
	};
}

module.exports = controller;
