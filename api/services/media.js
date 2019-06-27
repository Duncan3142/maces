'use strict';

function mediaQuery(MediaModel) {
	return function(mimeFilter) {
		return MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.whereIn('type', mimeFilter)
			.orderBy(['type', 'name']);
	};
}
function get(MediaModel, mimeFilters) {
	return function(usage) {
		const query = mediaQuery(MediaModel);
		return query(mimeFilters[usage]);
	};
}

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
	return function() {
		return MediaModel.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.orderBy(['type', 'name']);
	};
}

function checkMediaExists(MediaModel, mimeFilter) {
	return async function(mediaID) {
		const media = await MediaModel
			.query()
			.select(['id'])
			.where('id', mediaID)
			.whereIn('type', mimeFilter)
			.first();
		return media ? media.id === mediaID : false;
	};
}

function isValidID(id, check) {
	return id < 0 ? true : check(id);
}

function validMediaID(MediaModel, mimeFilters) {
	return function(usage) {
		const check = checkMediaExists(MediaModel, mimeFilters[usage]);
		return async function (mediaID) {
			return await isValidID(mediaID, check);
		};
	};
}

async function deleteGraph(MediaModel, trnx, mediaID) {
	const media = await MediaModel.query(trnx).findById(mediaID);
	if (media) {
		await media.$relatedQuery('event', trnx).unrelate();
		await MediaModel.query(trnx).deleteById(mediaID);
	}
}

function deleteTransaction(MediaModel) {
	return function(mediaID) {
		return async function() {
			const trnx = await MediaModel.startTransaction();
			try {
				await deleteGraph(MediaModel, trnx, mediaID);
				return trnx.commit();
			} catch(err) {
				trnx.rollback(err);
				throw err;
			}
		};
	};
}

function upsertTransaction(MediaModel) {
	return function(media) {
		return async function() {
			const trnx = await MediaModel.startTransaction();
			try {
				await MediaModel
					.query(trnx)
					.upsertGraph(media,
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

function fetch(MediaModel) {
	return function(mediaID) {
		return MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'link_text',
				'type'
			])
			.where('id', mediaID)
			.first();
	};
}

function fetchData(MediaModel) {
	return async function(mediaID, ETag) {
		const result = {};
		const unmodified = await checkHash(MediaModel)(mediaID, ETag);
		if (unmodified) {
			result.status = 304;
		} else {
			const media = await getFile(MediaModel)(mediaID);
			result.headers = [
				{
					name: 'ETag',
					value: media.hash
				}
			],
			result.contentType = media.type;
			result.payload = media.file;
		}
	};
}

function controller(database, mimeFilters) {
	const MediaModel = database.getModel('media');
	return {
		upsert: upsertTransaction(MediaModel),
		delete: deleteTransaction(MediaModel),
		list: list(MediaModel),
		fetch: fetch(MediaModel),
		fetchData: fetchData(MediaModel),
		validID: validMediaID(MediaModel, mimeFilters)
	};
}

module.exports = controller;
