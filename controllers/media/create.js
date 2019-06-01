function get(mimeTypes) {
	return function(req, res) {
		res.render('admin/media_form', {title: 'Upload media', mimeTypes});
	};
}

function mediaInsertQuery(Media, data) {
	return Media
		.query()
		.insert(data);
}

async function insertMedia(Media, data, res, next) {
	try {
		await mediaInsertQuery(Media, data);
		res.redirect('/admin/media');
	} catch (err) {
		next(err);
	}
}

async function validateFileCreate(mimeTypes, errors, Media, req, res, next) {

	if (errors.isEmpty()) {
		const data = {
			description: req.body.description,
			name: req.file.originalname,
			type: req.file.mimetype,
			file: req.file.buffer
		};

		await insertMedia(Media, data, res, next);
	} else {
		const data = {
			description: req.body.description
		};
		// There are errors. Render the form again with sanitized values/error messages.
		res.render('admin/media_form', { title: 'Upload media', mimeTypes, data, errors: errors.mapped() });
	}
}

function createFile(database, validationResult, mimeTypes) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const Media = database.getModel('media');

		await validateFileCreate(mimeTypes, errors, Media, req, res, next);
	};
}

function post(multer, validators, database, mimeTypes) {

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

		// Process request after validation and sanitization.
		createFile(database, validationResult, mimeTypes)
	];
}

function flattenMimeFilters(mimeFilters) {
	return [].concat(mimeFilters.images).concat(mimeFilters.documents);
}

function controller(multer, validators, database, mimeFilters) {

	const mimeTypes = flattenMimeFilters(mimeFilters);

	return {
		get: get(mimeTypes),
		post: post(multer, validators, database, mimeTypes)
	};
}

module.exports = controller;
