'use strict';

function eventList(req, res) {
	res.send('NOT IMPLEMENTED: event list');
}

// Display detail page for a specific event.
function eventDetail(req, res) {
	res.send('NOT IMPLEMENTED: event detail: ' + req.params.id);
}

// Display event create form on GET.
function eventCreateGet(req, res) {
	res.send('NOT IMPLEMENTED: event create GET');
}

// Handle event create on POST.
function eventCreatePost(req, res) {
	res.send('NOT IMPLEMENTED: event create POST');
}

// Display event delete form on GET.
function eventDeleteGet(req, res) {
	res.send('NOT IMPLEMENTED: event delete GET');
}

// Handle event delete on POST.
function eventDeletePost(req, res) {
	res.send('NOT IMPLEMENTED: event delete POST');
}

// Display event update form on GET.
function eventUpdateGet(req, res) {
	res.send('NOT IMPLEMENTED: event update GET');
}

// Handle event update on POST.
function eventUpdatePost(req, res) {
	res.send('NOT IMPLEMENTED: event update POST');
}

function eventController() {
	return {
		// Display list of all events.
		event_list: eventList,

		// Display detail page for a specific event.
		event_detail: eventDetail,

		// Display event create form on GET.
		event_create_get: eventCreateGet,

		// Handle event create on POST.
		event_create_post: eventCreatePost,

		// Display event delete form on GET.
		event_delete_get: eventDeleteGet,

		// Handle event delete on POST.
		event_delete_post: eventDeletePost,

		// Display event update form on GET.
		event_update_get: eventUpdateGet,

		// Handle event update on POST.
		event_update_post: eventUpdatePost,
	};
}

module.exports = eventController;
