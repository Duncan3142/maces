'use strict';

async function deleteMedia(deleteQuery, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await deleteQuery();
		res.redirect('/admin/media');
	} catch(err) {
		next(err);
	}
}

function removeMedia(validationResult, queries) {
	return async function(req, res, next) {
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			const mediaQueries = queries.media;
			const deleteQuery = mediaQueries.delete(req.params.id);
			await deleteMedia(deleteQuery, { req, res, next });
		} else {
			res.redirect('/admin/media');
		}
	};
}

function remove(validators, queries) {
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'ID must be an integer').isInt().toInt(),
		removeMedia(validationResult, queries)
	];
}

function controller(validators, queries) {
	return remove(validators, queries);
}

module.exports = controller;
