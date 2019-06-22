'use strict';

async function renderForm(queries, routeHandles) {
	const req = routeHandles.req;
	const res = routeHandles.res;
	const next = routeHandles.next;

	const mediaQueries = queries.media;

	const media = await mediaQueries.fetch(req.params.id);
	if (media) {
		res.render('admin/media_update', {title: 'Update media', media});
	} else {
		const err = new Error('Media not found');
		err.status = 404;
		next(err);
	}
}

function renderMedia(validationResult, queries) {
	return async function (req, res, next) {
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			await renderForm(queries, { req, res, next });
		} else {
			res.redirect('admin/media');
		}
	};
}

function get(validators, queries) {

	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'Media ID required').isInt().toInt(),
		renderMedia(validationResult, queries)
	];
}

async function upsertMedia(upsertQuery, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await upsertQuery();
		res.redirect('/admin/media');
	} catch (err) {
		next(err);
	}
}

function validateFileUpsert(validationResult, queries) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);

		const media = {
			id: req.params.id,
			description: req.body.description,
			link_text: req.body.link_text,
		};

		if (errors.isEmpty()) {
			const mediaQueries = queries.media;
			const upsertQuery = mediaQueries.upsert(media);

			await upsertMedia(upsertQuery, { req, res, next });
		} else {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('admin/media_update', { title: 'Update media', media, errors: errors.mapped() });
		}
	};
}

function post(validators, queries) {

	const bodyValidator = validators.body;
	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [

		paramValidator.check('id', 'Media ID required').isInt().toInt(),

		// Validate that the description field is not empty.
		bodyValidator.check('description', 'Media description required').isLength({ min: 1 }).trim(),

		// Validate that the link_text field is not empty.
		bodyValidator.check('link_text', 'Link text required').isLength({ min: 1 }).trim(),

		// Process request after validation and sanitization.
		validateFileUpsert(validationResult, queries)
	];
}

function controller(validators, queries) {

	return {
		get: get(validators, queries),
		post: post(validators, queries)
	};
}

module.exports = controller;
