'use strict';

function mediaContoller(list, create, update, remove) {
	return {
		// Display list of all media.
		list: list,

		// Display media create form on GET.
		create_get: create.get,

		// Handle media create on POST.
		create_post: create.post,

		// Display media update form on GET.
		update_get: update.get,

		// Handle media update on POST.
		update_post: update.post,

		remove: remove
	};
}

module.exports = mediaContoller;
