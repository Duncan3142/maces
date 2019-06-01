function unrelateEventQuery(media) {
	return media
		.$relatedQuery('event')
		.unrelate();
}

function deleteMediaQuery(Media, id) {
	return Media
		.query()
		.deleteById(id);
}

async function deleteMedia(Media, mediaID, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		const media = await Media.query().findById(mediaID);
		if (media) {
			await unrelateEventQuery(media);
			await deleteMediaQuery(Media, mediaID);
		}
		res.redirect('/admin/media');
	} catch(err) {
		next(err);
	}
}

async function validateRemoveMedia(errors, Media, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

	if (errors.isEmpty()) {
		await deleteMedia(Media, req.params.id, routeHandles);
	} else {
		res.redirect('/admin/media');
	}
}

function removeMedia(Media, validationResult) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		await validateRemoveMedia(errors, Media, { req, res, next });
	};
}

function remove(database, validators) {
	const Media = database.getModel('media');
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt(),
		paramValidator.filter('id').toInt(),
		removeMedia(Media, validationResult)
	];
}

function controller(database, validators) {
	return remove(database, validators);
}

module.exports = controller;
