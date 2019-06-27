'use strict';

function fetch(AdminModel) {
	return function(filter) {
		return AdminModel
			.query()
			.where(filter.key, filter.value)
			.first();
	};
}

function controller(database) {
	const AdminModel = database.getModel('admin');
	return {
		fetch: fetch(AdminModel)
	};
}

module.exports = controller;
