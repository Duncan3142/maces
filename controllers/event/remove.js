async function deleteEventGraph(EventModel, trnx, eventID) {
	const event = await EventModel.query(trnx).findById(eventID);
	if (event) {
		await event.$relatedQuery('media', trnx).unrelate();
		await EventModel.query(trnx).deleteById(eventID);
	}
}

async function deleteEventTransaction(database, eventID) {
	const EventModel = database.getModel('event');
	const trnx = await database.startTransaction();
	try {
		await deleteEventGraph(EventModel, trnx, eventID);
		return trnx.commit();
	} catch(err) {
		return trnx.rollback(err);
	}
}

async function deleteEvent(database, eventID, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await deleteEventTransaction(database, eventID);
		res.redirect('/admin/event');
	} catch(err) {
		next(err);
	}
}

async function validateRemoveEvent(errors, database, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

	if (errors.isEmpty()) {
		await deleteEvent(database, req.params.id, routeHandles);
	} else {
		res.redirect('/admin/event');
	}
}

function removeEvent(database, validationResult) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		await validateRemoveEvent(errors, database, { req, res, next });
	};
}

function remove(database, validators) {
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt(),
		paramValidator.filter('id').toInt(),
		removeEvent(database, validationResult)
	];
}

function controller(database, validators) {
	return remove(database, validators);
}

module.exports = controller;
