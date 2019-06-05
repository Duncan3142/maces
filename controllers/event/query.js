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
				return trnx.rollback(err);
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

function controller(database) {
	return {
		upsert: upsertTransaction(database),
		fetch: fetch(database),
		exists: exists(database)
	};
}

module.exports = controller;
