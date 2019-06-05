function getItem(media) {
	return function(usage) {
		return media.reduce((acc, elem) => {
			let result = acc;
			if (elem.usage === usage) {
				result.id = elem.id;
			}
			return result;
		}, {usage: usage, id: -1});
	};
}

async function renderForm(queries, routeHandles) {
	const req = routeHandles.req;
	const res = routeHandles.res;
	const next = routeHandles.next;

	const eventQueries = queries.event;
	const mediaQueries = queries.media;

	const event = await eventQueries.fetch(req.params.id);
	if (event) {
		const getMedia = getItem(event.media);
		const [images, flyers] = await mediaQueries.selected(['image', 'flyer'].map(getMedia));
		res.render('admin/event_form', {title: 'Update event', event, images, flyers});
	} else {
		const err = new Error('Event not found');
		err.status = 404;
		next(err);
	}
}

function renderEvent(validationResult, queries) {
	return async function (req, res, next) {
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			await renderForm(queries, { req, res, next });
		} else {
			res.redirect('admin/event');
		}
	};
}

function get(validators, queries) {

	const paramValidator = validators.param;
	const validationResult = validators.result;

	return [
		paramValidator.check('id', 'Event id required').isInt(),
		paramValidator.filter('id').toInt(),
		renderEvent(validationResult, queries)
	];
}

function post(validators, upsert, queries) {

	const paramValidator = validators.param;
	const eventQueries = queries.event;

	const fields = ['id','title','description','when','location','start','end','media'];

	return [

		paramValidator.check('id', 'Event id required').isInt(),
		paramValidator.filter('id').toInt(),
		paramValidator.check('id', 'Event does not exist').custom(eventQueries.exists),

		// Generic validators
		...upsert.validators,
		// Execute validated upsert
		upsert.execute(fields, 'Update')
	];
}

function controller(validators, upsert, queries) {
	return {
		get: get(validators, queries),
		post: post(validators, upsert, queries)
	};
}

module.exports = controller;
