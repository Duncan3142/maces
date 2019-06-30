'use strict';

function upsertTransaction(EventModel) {
	return async function(event, res) {
		const trnx = await EventModel.startTransaction();
		try {
			await EventModel
				.query(trnx)
				.upsertGraph(event,
					{
						relate: true,
						unrelate: true
					});
			trnx.commit();
			res.sendStatus(200);
		} catch (err) {
			trnx.rollback(err);
			throw err;
		}
	};
}

const mediaProjection = builder => builder.select(['media.id', 'media.description', 'media.name', 'media.link_text', 'media.type']);

function fetch(EventModel) {
	return async function({id}, res) {
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
			.where('id', id)
			.first()
			.eager('[image(mediaProjection), document(mediaProjection)]', {
				mediaProjection: mediaProjection
			});
		res.json(event);
	};
}

function exists(EventModel) {
	return async function({id}) {
		const event = await EventModel
			.query()
			.select(['id'])
			.where('id', id)
			.first();
		return event ? event.id === id : false;
	};
}

function list(EventModel) {
	return async function(_, res) {
		const events = await EventModel
			.query()
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
			.eager('[image(mediaProjection), document(mediaProjection)]', {
				mediaProjection: mediaProjection
			});
		res.json(events);
	};
}

function upcoming(EventModel) {
	return async function(_, res) {
		const events = await EventModel
			.query()
			.select([
				'event.id',
				'event.title',
				'event.description',
				'event.when',
				'event.location',
				'event.start',
				'event.end'
			])
			.where('event.end', '>', new Date())
			.orderBy('start')
			.eager('[image(mediaProjection), document(mediaProjection)]', {
				mediaProjection: mediaProjection
			});
		res.json(events);
	};
}

function _delete(EventModel) {
	return async function({id}, res) {
		await EventModel.query().deleteById(id);
		res.sendStatus(200);
	};
}

function controller(database) {
	const EventModel = database.getModel('event');
	return {
		upsert: upsertTransaction(EventModel),
		delete: _delete(EventModel),
		list: list(EventModel),
		fetch: fetch(EventModel),
		exists: exists(EventModel),
		upcoming: upcoming(EventModel)
	};
}

module.exports = controller;
