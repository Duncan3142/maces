function imageQuery(Media, mimeFilter) {
	return Media
		.query()
		.select([
			'id',
			'name',
			'description',
			'type'
		])
		.whereIn('type', mimeFilter)
		.orderBy(['type', 'name']);
}

function documentQuery(Media, mimeFilter) {
	return Media
		.query()
		.select([
			'id',
			'name',
			'description',
			'type'
		])
		.whereIn('type', mimeFilter)
		.orderBy(['type', 'name']);
}

function get(modelRegistry, mimeFilters) {
	return async function (req, res) {
		const Media = modelRegistry.get('media');
		const [images, docs] = await Promise.all([imageQuery(Media, mimeFilters.images), documentQuery(Media, mimeFilters.documents)]);
		res.render('event_form', {title: 'Create event', images, docs});
	};
}

function eventInsertQuery(Event, event) {
	return Event
		.query()
		.insert(event);
}

async function insertEvent(Event, event, res, next) {
	try {
		await eventInsertQuery(Event, event);
		res.redirect('/');
	} catch (err) {
		next(err);
	}
}

function checkSelected(available, selectedID) {
	return available.map(elem => {
		if (elem.id === selectedID) {
			elem.checked = 'true';
		}
		return elem;
	});
}

async function validateEventCreate(errors, models, req, res, next) {

	const event = {
		title: req.body.title,
		description: req.body.description,
		when: req.body.when,
		location: req.body.location,
		start: req.body.start,
		end: req.body.end,
		images: req.body.images
	};

	if (errors.isEmpty()) {
		await insertEvent(models.Event, event, res, next);
	} else {
		// There are errors. Render the form again with sanitized values/error messages.
		const availableImages = await imageQuery(models.Media);
		const checkedImages = checkSelected(availableImages, event.images);
		res.render('event_form', { title: 'Create event', event, checkedImages, errors: errors.mapped() });
	}
}

function createEvent(modelRegistry, validationResult) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const models = {
			Event: modelRegistry.get('event'),
			Media: modelRegistry.get('media')
		};

		await validateEventCreate(errors, models, req, res, next);
	};
}

const startBeforeEnd = (start, { req }) => (start <= req.body.end);

// function coerceImages(req, res, next) {
// 	if (!Array.isArray(req.body.images)) {
// 		if (req.body.images) {
// 			req.body.images = new Array(req.body.images);
// 		} else {
// 			req.body.images = [];
// 		}
// 	}
// 	next();
// }

function post(validators, modelRegistry) {

	const bodyValidator = validators.body;
	const validationResult = validators.result;

	return [

		// coerceImages,

		bodyValidator.check('title', 'Event title required').isLength({ min: 1 }).trim(),

		bodyValidator.check('description', 'Event description required').isLength({ min: 1 }).trim(),

		bodyValidator.check('when', 'Event date required').isLength({ min: 1 }).trim(),

		bodyValidator.check('location', 'Event location required').isLength({ min: 1 }).trim(),

		bodyValidator.check('start', 'Event start required').isISO8601({ strict: true }),

		bodyValidator.check('end', 'Event end required').isISO8601({ strict: true }),

		bodyValidator.filter('title').trim(),

		bodyValidator.filter('description').trim(),

		bodyValidator.filter('when').trim(),

		bodyValidator.filter('location').trim(),

		bodyValidator.filter('start').toDate(),

		bodyValidator.filter('end').toDate(),

		// bodyValidator.filter('image.*').escape(),

		// bodyValidator.filter('document.*').escape(),

		bodyValidator.check('start', 'Start date must not come after end date').custom(startBeforeEnd),

		// Process request after validation and sanitization.
		createEvent(modelRegistry, validationResult)
	];
}

function controller(validators, modelRegistry, mimeFilters) {
	return {
		get: get(modelRegistry, mimeFilters),
		post: post(validators, modelRegistry)
	};
}

module.exports = controller;
