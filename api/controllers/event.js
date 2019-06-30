'use strict';

const startBeforeEnd = (start, { req }) => (start <= req.body.end);

function validatorDefs(mediaService) {
	return function(buildCheckFunction) {
		const param = buildCheckFunction(['params']);
		const body = buildCheckFunction(['body']);

		return [
			{
				name: 'id',
				middleware: param('id', 'Event ID required').isInt().toInt(),
			},
			{
				name: 'title',
				set: 'core',
				middleware: body('title', 'Event title required').trim().isLength({ min: 1 })
			},
			{
				name: 'description',
				set: 'core',
				middleware: body('description', 'Event description required').trim().isLength({ min: 1 })
			},
			{
				name: 'when',
				set: 'core',
				middleware: body('when', 'Event date required').trim().isLength({ min: 1 })
			},
			{
				name: 'location',
				set: 'core',
				middleware: body('location', 'Event location required').trim().isLength({ min: 1 })
			},
			{
				name: 'start',
				set: 'core',
				middleware: body('start', 'Event start required').isISO8601({ strict: true }).toDate()
			},
			{
				name: 'end',
				set: 'core',
				middleware: body('end')
					.isISO8601({ strict: true }).withMessage('Event end required')
					.toDate()
					.custom(startBeforeEnd).withMessage('Start date must not come after end date')
			},
			{
				name: 'image',
				set: 'core',
				middleware: body('image')
					.isInt().withMessage('Image ID must be an integer')
					.toInt()
					.custom(mediaService.validID('image')).withMessage('Image ID must exist')
			},
			{
				name: 'document',
				set: 'core',
				middleware: body('document')
					.isInt().withMessage('Document ID must be an integer')
					.toInt()
					.custom(mediaService.validID('document')).withMessage('Document ID must exist')
			}
		];
	};
}

function routeDef(mediaService, eventService) {
	return {
		validators: validatorDefs(mediaService),
		verbs: function(verbHandler) {
			return [
				{
					name: 'get',
					path: '/',
					handler: verbHandler({
						service: eventService.list,
						requireAuth: true
					})
				},
				{
					name: 'get',
					path: '/upcoming',
					handler: verbHandler({
						service: eventService.upcoming,
					})
				},
				{
					name: 'get',
					path: '/:id',
					handler: verbHandler({
						fields: ['id'],
						service: eventService.fetch,
						requireAuth: true
					})
				},
				{
					name: 'post',
					path: '/',
					handler: verbHandler({
						fields: ['title','description','when','location','start','end','image','document'],
						service: eventService.upsert,
						requireAuth: true
					})
				},
				{
					name: 'put',
					path: '/:id',
					handler: verbHandler({
						fields: ['id', 'title','description','when','location','start','end','image','document'],
						service: eventService.upsert,
						requireAuth: true
					})
				},
				{
					name: 'delete',
					path: '/:id',
					handler: verbHandler({
						fields: ['id'],
						service: eventService.delete,
						requireAuth: true
					})
				}
			];
		}
	};
}

module.exports = routeDef;
