function unrelateMediaQuery(event) {
	return event
		.$relatedQuery('media')
		.unrelate();
}

function deleteEventQuery(Event, id) {
	return Event
		.query()
		.deleteById(id);
}

async function deleteEvent(Event, eventID, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		const event = await Event.query().findById(eventID);
		if (event) {
			await unrelateMediaQuery(event);
			await deleteEventQuery(Event, eventID);
		}
		res.redirect('/admin/event');
	} catch(err) {
		next(err);
	}
}

async function validateRemoveEvent(errors, Event, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

	if (errors.isEmpty()) {
		await deleteEvent(Event, req.params.id, routeHandles);
	} else {
		res.redirect('/admin/event');
	}
}

function removeEvent(Event, validationResult) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		await validateRemoveEvent(errors, Event, { req, res, next });
	};
}

function remove(database, validators) {
	const Event = database.getModel('event');
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt(),
		paramValidator.filter('id').toInt(),
		removeEvent(Event, validationResult)
	];
}

function controller(database, validators) {
	return remove(database, validators);
}

module.exports = controller;
