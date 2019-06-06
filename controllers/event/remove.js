async function deleteEvent(deleteQuery, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await deleteQuery();
		res.redirect('/admin/event');
	} catch(err) {
		next(err);
	}
}

function removeEvent(validationResult, queries) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			const eventQueries = queries.event;
			const deleteQuery = eventQueries.delete(req.params.id);
			await deleteEvent(deleteQuery, { req, res, next });
		} else {
			res.redirect('/admin/event');
		}
	};
}

function remove(validators, queries) {
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt(),
		paramValidator.filter('id').toInt(),
		removeEvent(validationResult, queries)
	];
}

function controller(validators, queries) {
	return remove(validators, queries);
}

module.exports = controller;
