function fetch(database) {
	const AdminModel = database.getModel('admin');
	return function(key) {
		return AdminModel
			.query()
			.where(key.field, key.value)
			.first();
	};
}

function controller(database) {
	return {
		fetch: fetch(database)
	};
}

module.exports = controller;
