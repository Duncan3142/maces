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

function get(database, mimeFilters) {
	return async function (req, res) {
		const Media = database.getModel('media');
		const [images, flyers] = await mediaQueries(Media, mimeFilters);
		res.render('admin/event_form', {title: 'Create event', images, flyers});
	};
}

async function eventUpsertTransaction(database, event) {
	const Event = database.getModel('event');
	const trnx = await database.startTransaction();
	try {
		await Event
			.query(trnx)
			.upsertGraph(event,
				{
					relate: true,
					unrelate: true
				});
		return trnx.commit();
	} catch (err) {
		return trnx.rollback(err);
	}
}

async function insertEvent(database, event, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await eventUpsertTransaction(database, event);
		res.redirect('/admin/event');
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

function mediaArray(imageID, flyerID) {
	const media = [];
	if (imageID >= 0) {
		media.push({id: imageID, usage: 'image'});
	}
	if (flyerID >= 0) {
		media.push({id: flyerID, usage: 'flyer'});
	}
	return media;
}

async function validateEventCreate(errors, database, mimeFilters, routeHandles) {

	const req = routeHandles.req;
	const res = routeHandles.res;

	const Media = database.getModel('media');

	const event = {
		title: req.body.title,
		description: req.body.description,
		when: req.body.when,
		location: req.body.location,
		start: req.body.start,
		end: req.body.end,
		media: mediaArray(req.body.image, req.body.flyer)
	};

	if (errors.isEmpty()) {
		await insertEvent(database, event, routeHandles);
	} else {
		// There are errors. Render the form again with sanitized values/error messages.
		const [availableImages, availableFlyers] = await mediaQueries(Media, mimeFilters);
		const images = markSelected(availableImages, req.body.image);
		const flyers = markSelected(availableFlyers, req.body.flyer);
		res.render('admin/event_form', { title: 'Create event', event, images, flyers, errors: errors.mapped() });
	}
}

function createEvent(database, validationResult, mimeFilters) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		await validateEventCreate(errors, database, mimeFilters, { req, res, next });
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

function post(validators, database, mimeFilters) {

	const bodyValidator = validators.body;
	const validationResult = validators.result;
	const Media = database.getModel('media');

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
		createEvent(database, validationResult, mimeFilters)
	];
}

function controller(validators, database, mimeFilters) {
	return {
		get: get(database, mimeFilters),
		post: post(validators, database, mimeFilters)
	};
}

module.exports = controller;
