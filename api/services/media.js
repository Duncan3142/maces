'use strict';

function checkHash(MediaModel) {
	return async function (id, hash) {
		let result = hash ? true : false;
		if (result) {
			const media = await MediaModel
				.query()
				.select([
					'id'
				])
				.where('id', id)
				.andWhere('hash', hash)
				.first();
			result = media ? true : false;
		}
		return result;
	};
}

function getFile(MediaModel) {
	return function(id) {
		return MediaModel.query()
			.select([
				'type',
				'file',
				'hash'
			])
			.where('id', id)
			.first();
	};
}

function list(MediaModel) {
	return async function(_, res) {
		const media = await MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.orderBy(['type', 'name']);
		res.json(media);
	};
}

function listUsage(MediaModel, mimeFilters) {
	return async function({usage},res) {
		const media = await MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.whereIn('type', mimeFilters[usage])
			.orderBy(['type', 'name']);
		res.json(media);
	};
}

function validMediaID(MediaModel, mimeFilters) {
	return function(usage) {
		return async function(id) {
			const media = await MediaModel
				.query()
				.select(['id'])
				.where('id', id)
				.whereIn('type', mimeFilters[usage])
				.first();
			return media ? media.id === id : false;
		};
	};
}

function _delete(MediaModel) {
	return async function({id}, res) {
		await MediaModel.query().deleteById(id);
		res.sendStatus(200);
	};
}

function upsertTransaction(MediaModel) {
	return async function(media, res) {
		const trnx = await MediaModel.startTransaction();
		try {
			await MediaModel
				.query(trnx)
				.upsertGraph(media,
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

function fetch(MediaModel) {
	return async function({id}, res) {
		const media = await MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.where('id', id)
			.first();
		res.json(media);
	};
}

function fetchData(MediaModel) {
	const _checkHash = checkHash(MediaModel);
	const _getFile = getFile(MediaModel);
	return async function({id, ['if-none-match']:ETag}, res) {
		const unmodified = await _checkHash(id, ETag);
		if (unmodified) {
			res.sendStatus(304);
		} else {
			const media = await _getFile(id);
			res.set({
				ETag: media.hash,
				'Content-Type': media.type
			});
			res.send(media.file);
		}
	};
}

function controller(database, mimeFilters) {
	const MediaModel = database.getModel('media');
	return {
		upsert: upsertTransaction(MediaModel),
		delete: _delete(MediaModel),
		list: list(MediaModel),
		listUsage: listUsage(MediaModel, mimeFilters),
		fetch: fetch(MediaModel),
		fetchData: fetchData(MediaModel),
		validID: validMediaID(MediaModel, mimeFilters)
	};
}

module.exports = controller;
