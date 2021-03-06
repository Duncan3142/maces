function upsertTransaction(database) {
	const EventModel = database.getModel('event');
	return function(event) {
		return async function() {
			const trnx = await database.startTransaction();
			try {
				await EventModel
					.query(trnx)
					.upsertGraph(event,
						{
							relate: true,
							unrelate: true
						});
				return trnx.commit();
			} catch (err) {
				trnx.rollback(err);
				throw err;
			}
		};
	};
}

function fetch(database) {
	const EventModel = database.getModel('event');
	return function(eventID) {
		return EventModel
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
			.where('id', eventID)
			.first()
			.eager('media(mediaProjection)', {
				mediaProjection: builder => builder.select(['media.id', 'usage'])
			});
	};
}

function exists(database) {
	const EventModel = database.getModel('event');
	return async function(eventID) {
		const event = await EventModel
			.query()
			.select(['id'])
			.where('id', eventID)
			.first();
		return event ? event.id === eventID : false;
	};
}

function list(database) {
	const EventModel = database.getModel('event');
	return function() {
		return EventModel.query()
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
				mediaProjection: builder => builder.select(['media.id', 'media.description', 'media.name', 'media.type', 'media.link_text', 'usage'])
			});
	};
}

async function deleteGraph(EventModel, trnx, eventID) {
	const event = await EventModel.query(trnx).findById(eventID);
	if (event) {
		await event.$relatedQuery('media', trnx).unrelate();
		await EventModel.query(trnx).deleteById(eventID);
	}
}

function deleteTransaction(database) {
	const EventModel = database.getModel('event');
	return function(eventID) {
		return async function() {
			const trnx = await database.startTransaction();
			try {
				await deleteGraph(EventModel, trnx, eventID);
				return trnx.commit();
			} catch(err) {
				trnx.rollback(err);
				throw err;
			}
		};
	};
}

function upcoming(database) {
	const EventModel = database.getModel('event');
	return function() {
		return EventModel.query()
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
				mediaProjection: builder => builder.select(['media.id', 'media.description', 'media.name', 'media.link_text', 'media.type', 'usage'])
			});
	};
}

function controller(database) {
	return {
		upsert: upsertTransaction(database),
		fetch: fetch(database),
		exists: exists(database),
		list: list(database),
		delete: deleteTransaction(database),
		upcoming: upcoming(database)
	};
}

module.exports = controller;
