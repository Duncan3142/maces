'use strict';

function eventController(list, create) {
	return {

		list: list,

		// Display event create form on GET.
		create_get: create.get,

		// Handle event create on POST.
		create_post: create.post
	};
}

module.exports = eventController;
