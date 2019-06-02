async function deleteMediaGraph(MediaModel, trnx, mediaID) {
	const media = await MediaModel.query(trnx).findById(mediaID);
	if (media) {
		await media.$relatedQuery('event', trnx).unrelate();
		await MediaModel.query(trnx).deleteById(mediaID);
	}
}

async function deleteMediaTransaction(database, mediaID) {
	const MediaModel = database.getModel('media');
	const trnx = await database.startTransaction();
	try {
		await deleteMediaGraph(MediaModel, trnx, mediaID);
		return trnx.commit();
	} catch(err) {
		return trnx.rollback(err);
	}
}

async function deleteMedia(database, mediaID, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await deleteMediaTransaction(database, mediaID);
		res.redirect('/admin/media');
	} catch(err) {
		next(err);
	}
}

async function validateRemoveMedia(errors, database, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

	if (errors.isEmpty()) {
		await deleteMedia(database, req.params.id, routeHandles);
	} else {
		res.redirect('/admin/media');
	}
}

function removeMedia(database, validationResult) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		await validateRemoveMedia(errors, database, { req, res, next });
	};
}

function remove(database, validators) {

	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt(),
		paramValidator.filter('id').toInt(),
		removeMedia(database, validationResult)
	];
}

function controller(database, validators) {
	return remove(database, validators);
}

module.exports = controller;
