'use strict';

function eventController(list, create, update, remove) {
	return {

		list: list,

		// Display event create form on GET.
		create_get: create.get,

		// Handle event create on POST.
		create_post: create.post,

		// Display event update form on GET.
		update_get: update.get,

		// Handle event update on POST.
		update_post: update.post,

		remove: remove
	};
}

module.exports = eventController;
