function get(req, res) {
	res.render('event_form', {title: 'Create event'});
}

function eventInsertQuery(Event, data) {
	return Event
		.query()
		.insert(data);
}

async function insertEvent(Event, data, res, next) {
	try {
		await eventInsertQuery(Event, data);
		res.redirect('/');
	} catch (err) {
		next(err);
	}
}

async function validateEventCreate(errors, Event, req, res, next) {

	const data = {
		title: req.body.title,
		description: req.body.description,
		when: req.body.when,
		location: req.body.location,
		start: req.body.start,
		end: req.body.end
	};

	if (errors.isEmpty()) {
		await insertEvent(Event, data, res, next);
	} else {
		// There are errors. Render the form again with sanitized values/error messages.
		res.render('event_form', { title: 'Create event', data, errors: errors.mapped() });
	}
}

function createEvent(models, validationResult) {
	return async (req, res, next) => {

		// Extract the validation errors from a request.
		const errors = validationResult(req);
		const Event = models.get('event');

		await validateEventCreate(errors, Event, req, res, next);
	};
}

const startBeforeEnd = (start, { req }) => (start <= req.body.end);

function post(validators, models) {

	const bodyValidator = validators.body;
	const validationResult = validators.result;

	return [

		bodyValidator.check('title', 'Event title required').isLength({ min: 1 }).trim(),

		bodyValidator.check('description', 'Event description required').isLength({ min: 1 }).trim(),

		bodyValidator.check('when', 'Event date required').isLength({ min: 1 }).trim(),

		bodyValidator.check('location', 'Event location required').isLength({ min: 1 }).trim(),

		bodyValidator.check('start', 'Event start required').isISO8601({strict: true}),

		bodyValidator.check('end', 'Event end required').isISO8601({strict: true}),

		bodyValidator.filter('title').trim(),

		bodyValidator.filter('description').trim(),

		bodyValidator.filter('when').trim(),

		bodyValidator.filter('location').trim(),

		bodyValidator.filter('start').toDate(),

		bodyValidator.filter('end').toDate(),

		bodyValidator.check('start', 'Start date must not come after end date').custom(startBeforeEnd),

		// Process request after validation and sanitization.
		createEvent(models, validationResult)
	];
}

function controller(validators, models) {
	return {
		get: get,
		post: post(validators, models)
	};
}

module.exports = controller;
