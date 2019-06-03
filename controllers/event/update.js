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

function getMediaID(media, usage) {
	return media.reduce((acc, elem) => {
		let result = acc;
		if (elem.usage === usage) {
			result = elem.id;
		}
		return result;
	}, -1);
}

async function renderForm(database, mimeFilters, routeHandles) {
	const req = routeHandles.req;
	const res = routeHandles.res;
	const next = routeHandles.next;

	const EventModel = database.getModel('event');

	const event = await EventModel
		.query()
		.select([
			'id',
			'title',
			'description',
			'when',
			'location',
			'start',
			'end'
		])
		.where('id', req.params.id)
		.first()
		.eager('media(mediaProjection)', {
			mediaProjection: builder => builder.select(['media.id', 'usage'])
		});
	if (event) {
		const Media = database.getModel('media');
		const [availableImages, availableFlyers] = await mediaQueries(Media, mimeFilters);
		const images = markSelected(availableImages, getMediaID(event.media, 'image'));
		const flyers = markSelected(availableFlyers, getMediaID(event.media, 'flyer'));
		res.render('admin/event_form', {title: 'Update event', event, images, flyers});
	} else {
		const err = new Error('Event not found');
		err.status = 404;
		next(err);
	}
}

async function validateRenderEvent(errors, database, mimeFilters, routeHandles) {

	const res = routeHandles.res;

	if (errors.isEmpty()) {
		await renderForm(database, mimeFilters, routeHandles);
	} else {
		res.redirect('admin/event');
	}
}

function renderEvent(database, validationResult, mimeFilters) {
	return async function (req, res, next) {
		const errors = validationResult(req);
		validateRenderEvent(errors, database, mimeFilters, { req, res, next });
	};
}

function get(validators, database, mimeFilters) {

	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'Event id required').isInt(),
		paramValidator.filter('id').toInt(),
		renderEvent(database, validationResult, mimeFilters)
	];
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

async function upsertEvent(database, event, routeHandles) {
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

function validateEventUpsert(database, validationResult, mimeFilters) {
	return async function (req, res, next) {

		const errors = validationResult(req);
		const Media = database.getModel('media');

		const event = {
			id: req.params.id,
			title: req.body.title,
			description: req.body.description,
			when: req.body.when,
			location: req.body.location,
			start: req.body.start,
			end: req.body.end,
			media: mediaArray(req.body.image, req.body.flyer)
		};

		if (errors.isEmpty()) {
			await upsertEvent(database, event, {req, res, next});
		} else {
			// There are errors. Render the form again with sanitized values/error messages.
			const [availableImages, availableFlyers] = await mediaQueries(Media, mimeFilters);
			const images = markSelected(availableImages, req.body.image);
			const flyers = markSelected(availableFlyers, req.body.flyer);
			res.render('admin/event_form', { title: 'Update event', event, images, flyers, errors: errors.mapped() });
		}
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

function checkEventExists(EventModel) {
	return async function(eventID) {
		const event = await EventModel
			.query()
			.select(['id'])
			.where('id', eventID)
			.first();
		return event ? event.id === eventID : false;
	};
}

function post(validators, database, mimeFilters) {

	const bodyValidator = validators.body;
	const paramValidator = validators.param;
	const validationResult = validators.result;
	const MediaModel = database.getModel('media');
	const EventModel = database.getModel('event');

	return [

		paramValidator.check('id', 'Event id required').isInt(),
		paramValidator.filter('id').toInt(),
		paramValidator.check('id', 'Event does not exist').custom(checkEventExists(EventModel)),

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
		bodyValidator.check('image', 'Image ID must exists').custom(validMediaID(MediaModel, mimeFilters.images)),

		bodyValidator.check('flyer', 'Flyer ID must be an integer').isInt(),
		bodyValidator.filter('flyer').toInt(),
		bodyValidator.check('flyer', 'Flyer ID must exists').custom(validMediaID(MediaModel, mimeFilters.documents)),

		// Process request after validation and sanitization.
		validateEventUpsert(database, validationResult, mimeFilters)
	];
}

function controller(validators, database, mimeFilters) {
	return {
		get: get(validators, database, mimeFilters),
		post: post(validators, database, mimeFilters)
	};
}

module.exports = controller;
