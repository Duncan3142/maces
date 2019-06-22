'use strict';

async function upsertEvent(upsertQuery, routeHandles) {
	const res = routeHandles.res;
	const next = routeHandles.next;
	try {
		await upsertQuery();
		res.redirect('/admin/event');
	} catch (err) {
		next(err);
	}
}

function mediaArray(desiredMedia) {
	return desiredMedia.reduce((acc, elem) => {
		if (elem.id >= 0) {
			acc.push(elem);
		}
		return acc;
	},[]);
}

function getEventField(name, req) {
	return name === 'id' ? req.params.id : ( name === 'media' ? mediaArray([{usage: 'image', id: req.body.image}, {usage: 'document', id: req.body.document}]) : req.body[name] );
}

function getEventData(req, fields) {
	return fields.reduce((acc, field) => {
		acc[field] = getEventField(field, req);
		return acc;
	}, {});
}

function validateEventUpsert(validationResult, queries) {
	return function(fields, action) {
		return async function (req, res, next) {

			const errors = validationResult(req);

			const eventData = getEventData(req, fields);

			if (errors.isEmpty()) {
				const eventQueries = queries.event;
				const upsertQuery = eventQueries.upsert(eventData);
				await upsertEvent(upsertQuery, { req, res, next });
			} else {
				const mediaQueries = queries.media;
				// There are errors. Render the form again with sanitized values/error messages.
				const [images, documents] = await mediaQueries.selected([{usage: 'image', id: req.body.image}, {usage: 'document', id: req.body.document}]);
				res.render('admin/event_form', { title: `${action} event`, eventData, images, documents, errors: errors.mapped() });
			}
		};
	};
}

const startBeforeEnd = (start, { req }) => (start <= req.body.end);

function commonValidators(validators, queries) {

	const bodyValidator = validators.body;
	const mediaQueries = queries.media;

	return [
		bodyValidator.check('title', 'Event title required').isLength({ min: 1 }).trim(),

		bodyValidator.check('description', 'Event description required').isLength({ min: 1 }).trim(),

		bodyValidator.check('when', 'Event date required').isLength({ min: 1 }).trim(),

		bodyValidator.check('location', 'Event location required').isLength({ min: 1 }).trim(),

		bodyValidator.check('start', 'Event start required').isISO8601({ strict: true }).toDate(),
		bodyValidator.check('end', 'Event end required')
			.isISO8601({ strict: true }).withMessage().toDate()
			.custom(startBeforeEnd).withMessage('Start date must not come after end date'),

		bodyValidator.check('image')
			.isInt().withMessage('Image ID must be an integer').toInt()
			.custom(mediaQueries.validID('image')).withMessage('Image ID must exist'),

		bodyValidator.check('document')
			.isInt().withMessage('Document ID must be an integer').toInt()
			.custom(mediaQueries.validID('document')).withMessage('Document ID must exist'),
	];
}

function controller(validators, queries) {
	return {
		validators: commonValidators(validators, queries),
		execute: validateEventUpsert(validators.result, queries)
	};
}

module.exports = controller;
