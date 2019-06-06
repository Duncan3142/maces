function get(mimeTypes) {
	return function(req, res) {
		res.render('admin/media_form', {title: 'Upload media', mimeTypes});
	};
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

function validateFileUpsert(validationResult, queries, mimeTypes) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);

		if (errors.isEmpty()) {
			const mediaData = {
				description: req.body.description,
				link_text: req.body.link_text,
				name: req.file.originalname,
				type: req.file.mimetype,
				file: req.file.buffer
			};

			const mediaQueries = queries.media;
			const upsertQuery = mediaQueries.upsert(mediaData);

			await upsertMedia(upsertQuery, { req, res, next });
		} else {
			const mediaData = {
				description: req.body.description,
				link_text: req.body.link_text,
			};
			// There are errors. Render the form again with sanitized values/error messages.
			res.render('admin/media_form', { title: 'Upload media', mimeTypes, mediaData, errors: errors.mapped() });
		}
	};
}

function post(multer, validators, queries, mimeTypes) {

	const maxFileSize = 5 * 1024 * 1024; // 5 MB upload limit;

	const bodyValidator = validators.body;
	const fileValidator = validators.file;
	const mimeTypesMatch = fileValidator.typeMatch;
	const validationResult = validators.result;

	const upload = multer({
		storage: multer.memoryStorage(),
		limits: {
			fileSize: maxFileSize, // 5 MB upload limit
			files: 1 // 1 file
		}
	});

	return [
		upload.single('file'),

		// Validate that the description field is not empty.
		bodyValidator.check('description', 'Media description required').isLength({ min: 1 }).trim(),

		// Validate that the description field is not empty.
		bodyValidator.check('link_text', 'Link text required').isLength({ min: 1 }).trim(),

		// Validate mime type.
		fileValidator.check('mimetype')
			.isIn(mimeTypes).withMessage(`File must be one of the following mime types: ${mimeTypes}`)
			.custom(mimeTypesMatch).withMessage('Claimed mime type must match actual mime type.'),

		// Validate the media name.
		fileValidator.check('originalname', 'Valid file name required').matches(/\w+(?:\.\w+)+/),

		// File size.
		fileValidator.check('size', `File must be less than ${maxFileSize / 1024 / 1024} MB`).isInt({max: maxFileSize}),

		// Sanitize (trim) the description field.
		bodyValidator.filter('description').trim(),

		// Sanitize (trim) the link text field.
		bodyValidator.filter('link_text').trim(),

		// Process request after validation and sanitization.
		validateFileUpsert(validationResult, queries, mimeTypes)
	];
}

function flattenMimeTypes(mimeFilters, required) {
	return required.reduce((acc, type) => {
		if (mimeFilters[type]) {
			acc = acc.concat(mimeFilters[type]);
		}
		return acc;
	}, []);
}

function controller(multer, validators, queries, mimeFilters) {

	const mimeTypes = flattenMimeTypes(mimeFilters, ['image', 'flyer']);

	return {
		get: get(mimeTypes),
		post: post(multer, validators, queries, mimeTypes)
	};
}

module.exports = controller;
