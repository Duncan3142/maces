function get(req, res) {
	res.render('media_form', {title: 'Upload media'});
}

function mediaUpdateQuery(Media, data) {
	return Media
		.query()
		.insert(data);
}

async function updateMedia(Media, data, res, next) {
	try {
		await mediaUpdateQuery(Media, data);
		res.redirect('/media');
	} catch (err) {
		next(err);
	}
}

function originalFileName(file) {
	return file ? file.originalname : '';
}

async function validateFileCreate(errors, Media, req, res, next) {

	if (errors.isEmpty()) {
		const data = {
			description: req.body.description,
			name: req.file.originalname,
			type: req.file.mimetype,
			file: req.file.buffer
		};

		await updateMedia(Media, data, res, next);
	} else {
		const data = {
			description: req.body.description,
			name: originalFileName(req.file)
		};
		// There are errors. Render the form again with sanitized values/error messages.
		res.render('media_form', { title: 'Upload media', data, errors: errors.array() });
	}
}

function createFile(models, validationResult) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const Media = models.get('media');

		await validateFileCreate(errors, Media, req, res, next);
	};
}

function post(multer, validators, models) {

	const maxFileSize = 5 * 1024 * 1024; // 5 MB upload limit;

	const bodyValidator = validators.body;
	const fileValidator = validators.file;
	const mimeTypesMatch = fileValidator.typeMatch;
	const maxSize = fileValidator.maxSize(maxFileSize);
	const validationResult = validators.result;

	const upload = multer({
		storage: multer.memoryStorage(),
		limits: {
			fileSize: maxFileSize, // 5 MB upload limit
			files: 1 // 1 file
		}
	});

	const mimeTypes = ['image/jpeg'];

	return [
		upload.single('file'),

		// Validate mime type.
		fileValidator.check('mimetype', `File must be one of the following mime types: ${mimeTypes}`).isIn(mimeTypes),

		// Validate the media name.
		fileValidator.check('originalname', 'Valid file name required').matches(/\w+(?:\.\w+)+/),

		// Validate mime type.
		fileValidator.check('mimetype', 'Claimed mime type must match actual mime type.').custom(mimeTypesMatch),

		// File size.
		fileValidator.check('size', `File must be less than ${maxFileSize / 1024 / 1024} MB.`).custom(maxSize),

		// Validate that the description field is not empty.
		bodyValidator.check('description', 'Media description required').isLength({ min: 1 }).trim(),

		// Sanitize (escape) the name field.
		fileValidator.filter('originalname').escape(),
		// Sanitize (escape) the mime type.
		fileValidator.filter('mimetype').escape(),
		// Sanitize (escape) the description field.
		bodyValidator.filter('description').trim().escape(),

		// Process request after validation and sanitization.
		createFile(models, validationResult)
	];
}

function controller(multer, validators, models) {
	return {
		get: get,
		post: post(multer, validators, models)
	};
}

module.exports = controller;
