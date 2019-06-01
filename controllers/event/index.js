'use strict';

function eventController(list, create, remove) {
	return {

		list: list,

		// Display event create form on GET.
		create_get: create.get,

		// Handle event create on POST.
		create_post: create.post,

		remove: remove
	};
}

module.exports = eventController;
