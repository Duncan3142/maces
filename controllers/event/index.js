'use strict';

function eventController(create) {
	return {

		// Display event create form on GET.
		create_get: create.get,

		// Handle event create on POST.
		create_post: create.post
	};
}

module.exports = eventController;
