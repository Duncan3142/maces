'use strict';

function eventQuery(Event) {
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
		.where('event.end', '>', new Date())
		.orderBy('start')
		.eager('media(mediaProjection)', {
			mediaProjection: builder => builder.select(['media.id', 'media.description', 'media.name', 'media.type'])
		});
}

async function renderEvents(Event, res, next) {
	try {
		const events = await eventQuery(Event);
		res.render('index', { title: 'Macmillan East Sheen Home', events });
	} catch(err) {
		next(err);
	}
}

function index(database) {
	return async function(req, res, next) {
		const Event = database.getModel('event');
		await renderEvents(Event, res, next);
	};
}

function controller(database) {
	return {
		index: index(database)
	};
}

// GET home page.
module.exports = controller;
