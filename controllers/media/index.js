'use strict';

function mediaDetail(req, res) {
	res.send('NOT IMPLEMENTED: media detail: ' + req.params.id);
}

function mediaDeleteGet(req, res) {
	res.send('NOT IMPLEMENTED: media delete GET');
}

function mediaDeletePost(req, res) {
	res.send('NOT IMPLEMENTED: media delete POST');
}

function mediaContoller(create, list) {
	return {
		// Display list of all media.
		list: list,

		// Display detail page for a specific media.
		detail: mediaDetail,

		// Display media create form on GET.
		create_get: create.get,

		// Handle media create on POST.
		create_post: create.post,

		// Display media delete form on GET.
		delete_get: mediaDeleteGet,

		// Handle media delete on POST.
		delete_post: mediaDeletePost
	};
}

module.exports = mediaContoller;
