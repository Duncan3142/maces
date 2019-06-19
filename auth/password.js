function set(admin, bcrypt) {
	return async function(password) {
		const hash = await bcrypt.hash(password, 16);
		admin.hash = hash;
	};
}

function validate(admin, bcrypt) {
	return async function(password) {
		return await bcrypt.compare(password, admin.hash);
	};
}

function passwordAuth(bcrypt) {
	return function(admin) {
		return {
			set: set(admin, bcrypt),
			validate: validate(admin, bcrypt)
		};
	};
}

module.exports = passwordAuth;
