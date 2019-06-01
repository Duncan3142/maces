function selectQuery(Event) {
	return Event.query()
		.select([
			'event.id',
			'event.title',
			'event.description',
			'event.when',
			'event.location',
			'event.start',
			'event.end',
		])
		.orderBy('start')
		.eager('media(mediaProjection)', {
			mediaProjection: builder => builder.select(['media.id', 'media.description', 'media.name', 'media.type', 'usage'])
		});
}

async function render(Event, res, next) {
	try {
		const events = await selectQuery(Event);
		res.render('admin/event', { title: 'Macmillan East Sheen Home', events });
	} catch(err) {
		next(err);
	}
}

function list(modelRegistry) {
	return async function(req, res, next) {
		const Event = modelRegistry.get('event');
		await render(Event, res, next);
	};
}

function controller(modelRegistry) {
	return list(modelRegistry);
}

module.exports = controller;
