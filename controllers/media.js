'use strict';

function mediaSelectQuery(Media) {
	return Media.query()
		.select([
			'id',
			'name',
			'description',
			'type'
		])
		.orderBy('type');
}

async function renderMedia(Media, res, next) {
	try {
		const media = await mediaSelectQuery(Media);
		res.render('media', { title: 'Macmillan East Sheen Home', media });
	} catch(err) {
		next(err);
	}
}

function mediaList(models) {
	return async function(req, res, next) {
		const Media = models.get('media');
		await renderMedia(Media, res, next);
	};
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

async function validateFileCreate(errors, Media, req, res, next) {

	if (errors.isEmpty()) {
		const data = {
			description: req.body.description,
			name: req.file.originalname,
			type: req.file.mimetype,
			file: req.file.buffer
		};

		await updateMedia(Media, data, res, next);
	}
	else {
		const data = {
			description: req.body.description,
			name: req.file.originalname
		};
		// There are errors. Render the form again with sanitized values/error messages.
		res.render('media_form', { title: 'Upload media', data, errors: errors.array()});
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

function mediaDetail(req, res) {
	res.send('NOT IMPLEMENTED: media detail: ' + req.params.id);
}

function mediaCreateGet(req, res) {
	res.render('media_form', {title: 'Upload media'});
}

function mediaDeleteGet(req, res) {
	res.send('NOT IMPLEMENTED: media delete GET');
}

function mediaDeletePost(req, res) {
	res.send('NOT IMPLEMENTED: media delete POST');
}

function mediaContoller(models, body, validationResult, sanitizeBody, multer) {

	const upload = multer({ storage: multer.memoryStorage() });

	return {
		// Display list of all media.
		media_list: mediaList(models),

		// Display detail page for a specific media.
		media_detail: mediaDetail,

		// Display media create form on GET.
		media_create_get: mediaCreateGet,

		// Handle media create on POST.
		media_create_post: [
			upload.single('file'),

			// Validate the media name.
			// body('name', 'Valid media name required').matches(/\w+(?:\.\w+)+/).trim(),
			// Validate that the name field is not empty.
			body('description', 'Media description required').isLength({ min: 1 }).trim(),

			// Sanitize (escape) the name field.
			// sanitizeBody('name').trim().escape(),
			// Sanitize (escape) the description field.
			sanitizeBody('description').trim().escape(),

			// Process request after validation and sanitization.
			createFile(models, validationResult)
		],

		// Display media delete form on GET.
		media_delete_get: mediaDeleteGet,

		// Handle media delete on POST.
		media_delete_post: mediaDeletePost
	};
}

module.exports = mediaContoller;
