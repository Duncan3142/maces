'use strict';

function mediaContoller(list, create) {
	return {
		// Display list of all media.
		list: list,

		// Display media create form on GET.
		create_get: create.get,

		// Handle media create on POST.
		create_post: create.post,
	};
}

module.exports = mediaContoller;
