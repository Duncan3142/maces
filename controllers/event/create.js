function mediaQuery(Media, mimeFilter) {
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

function mediaQueries(Media, mimeFilters) {
	return Promise.all([mediaQuery(Media, mimeFilters.images), mediaQuery(Media, mimeFilters.documents)]);
}

function get(modelRegistry, mimeFilters) {
	return async function (req, res) {
		const Media = modelRegistry.get('media');
		const [images, flyers] = await mediaQueries(Media, mimeFilters);
		res.render('event_form', {title: 'Create event', images, flyers});
	};
}

function eventInsertQuery(Event, event) {
	return Event
		.query()
		.insert(event);
}

async function insertEvent(Event, event, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await eventInsertQuery(Event, event);
		res.redirect('/');
	} catch (err) {
		next(err);
	}
}

function markSelected(available, selectedID) {
	return available.map(elem => {
		elem.selected = (elem.id === selectedID);
		return elem;
	});
}

async function validateEventCreate(errors, models, mimeFilters, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

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
		await insertEvent(models.Event, event, routeHandles);
	} else {
		// There are errors. Render the form again with sanitized values/error messages.
		const [availableImages, availableFlyers] = await mediaQueries(models.Media, mimeFilters);
		const images = markSelected(availableImages, event.imageID);
		const flyers = markSelected(availableFlyers, event.flyerID);
		res.render('event_form', { title: 'Create event', event, images, flyers, errors: errors.mapped() });
	}
}

function createEvent(modelRegistry, validationResult, mimeFilters) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const models = {
			Event: modelRegistry.get('event'),
			Media: modelRegistry.get('media')
		};

		await validateEventCreate(errors, models, mimeFilters, { req, res, next });
	};
}

const startBeforeEnd = (start, { req }) => (start <= req.body.end);

async function checkMediaExists(Media, mediaID, mimeFilter) {
	const media = await Media
		.query()
		.select(['id'])
		.where('id', mediaID)
		.whereIn('type', mimeFilter)
		.first();
	return media ? media.id === mediaID : false;
}

function validMediaID(Media, mimeFilter) {
	return async function (mediaID) {
		return mediaID < 0 ? true : await checkMediaExists(Media, mediaID, mimeFilter);
	};
}

function post(validators, modelRegistry, mimeFilters) {

	const bodyValidator = validators.body;
	const validationResult = validators.result;
	const Media = modelRegistry.get('media');

	return [

		bodyValidator.check('title', 'Event title required').isLength({ min: 1 }).trim(),
		bodyValidator.filter('title').trim(),


		bodyValidator.check('description', 'Event description required').isLength({ min: 1 }).trim(),
		bodyValidator.filter('description').trim(),

		bodyValidator.check('when', 'Event date required').isLength({ min: 1 }).trim(),
		bodyValidator.filter('when').trim(),

		bodyValidator.check('location', 'Event location required').isLength({ min: 1 }).trim(),
		bodyValidator.filter('location').trim(),

		bodyValidator.check('start', 'Event start required').isISO8601({ strict: true }),
		bodyValidator.filter('start').toDate(),
		bodyValidator.check('end', 'Event end required').isISO8601({ strict: true }),
		bodyValidator.filter('end').toDate(),
		bodyValidator.check('start', 'Start date must not come after end date').custom(startBeforeEnd),

		bodyValidator.check('image', 'Image ID must be an integer').isInt(),
		bodyValidator.filter('image').toInt(),
		bodyValidator.check('image', 'Image ID must exists').custom(validMediaID(Media, mimeFilters.images)),

		bodyValidator.check('flyer', 'Flyer ID must be an integer').isInt(),
		bodyValidator.filter('flyer').toInt(),
		bodyValidator.check('flyer', 'Flyer ID must exists').custom(validMediaID(Media, mimeFilters.documents)),

		// Process request after validation and sanitization.
		createEvent(modelRegistry, validationResult, mimeFilters)
	];
}

function controller(validators, modelRegistry, mimeFilters) {
	return {
		get: get(modelRegistry, mimeFilters),
		post: post(validators, modelRegistry, mimeFilters)
	};
}

module.exports = controller;
