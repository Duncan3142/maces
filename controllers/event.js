'use strict';

function eventController(models) {
	return {
		// Display list of all events.
		event_list(req, res) {
			res.send('NOT IMPLEMENTED: event list');
		},

		// Display detail page for a specific event.
		event_detail(req, res) {
			res.send('NOT IMPLEMENTED: event detail: ' + req.params.id);
		},

		// Display event create form on GET.
		event_create_get(req, res) {
			res.send('NOT IMPLEMENTED: event create GET');
		},

		// Handle event create on POST.
		event_create_post(req, res) {
			res.send('NOT IMPLEMENTED: event create POST');
		},

		// Display event delete form on GET.
		event_delete_get(req, res) {
			res.send('NOT IMPLEMENTED: event delete GET');
		},

		// Handle event delete on POST.
		event_delete_post(req, res) {
			res.send('NOT IMPLEMENTED: event delete POST');
		},

		// Display event update form on GET.
		event_update_get(req, res) {
			res.send('NOT IMPLEMENTED: event update GET');
		},

		// Handle event update on POST.
		event_update_post(req, res) {
			res.send('NOT IMPLEMENTED: event update POST');
		}
	}
}

module.exports = eventController;
