'use strict';

function mediaContoller(models, body, validationResult, sanitizeBody, multer) {

	const upload = multer({ storage: multer.memoryStorage() });

	return {
		// Display list of all media.
		media_list: async function(req, res, next) {
			const Media = models.get('media');
			try {
				const media = await Media.query()
					.select([
						'name',
						'description',
						'type'
					])
					.orderBy('type');
				res.render('media', { title: 'Macmillan East Sheen Home', media });
			} catch(err) {
				return next(err);
			}
		},

		// Display detail page for a specific media.
		media_detail: function(req, res) {
			res.send('NOT IMPLEMENTED: media detail: ' + req.params.id);
		},

		// Display media create form on GET.
		media_create_get: function(req, res) {
			res.render('media_form', {title: 'Upload media'});
		},

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
			async (req, res, next) => {

				// Extract the validation errors from a request.
				const errors = validationResult(req);

				const data = { description: req.body.description};

				if (!errors.isEmpty()) {
					// There are errors. Render the form again with sanitized values/error messages.
					res.render('media_form', { title: 'Upload media', data, errors: errors.array()});
					return;
				}
				else {
					data.name = req.file.originalname;
					data.type = req.file.mimetype;
					data.file = req.file.buffer;

					const Media = models.get('media');

					try {
						const media = await Media
							.query()
							.insert(data);

						res.redirect('/media');
					} catch (err) {
						return next(err);
					}

				}
			}
		],

		// Display media delete form on GET.
		media_delete_get: function(req, res) {
			res.send('NOT IMPLEMENTED: media delete GET');
		},

		// Handle media delete on POST.
		media_delete_post: function(req, res) {
			res.send('NOT IMPLEMENTED: media delete POST');
		}
	}
}

module.exports = mediaContoller;
