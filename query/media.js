function mediaQuery(database) {
	return function(mimeFilter) {
		const MediaModel = database.getModel('media');
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

function list(database) {
	const MediaModel = database.getModel('media');
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

function get(database, mimeFilters) {
	return function(usage) {
		const query = mediaQuery(database);
		return query(mimeFilters[usage]);
	};
}

function getAll(getter) {
	return function (usages) {
		return Promise.all(usages.map(getter));
	}
}

function markSelected(available, selectedID) {
	return available.map(elem => {
		elem.selected = (elem.id === selectedID);
		return elem;
	});
}

function getSelect(getter) {
	return async function (selected) {
		const available = await getter(selected.usage);
		return markSelected(available, selected.id);
	};
}

function selectAll(getter) {
	return function(selected) {
		return Promise.all(selected.map(getSelect(getter)));
	};
}

function checkMediaExists(database, mimeFilter) {
	const MediaModel = database.getModel('media');
	return async function(mediaID) {
		const media = await MediaModel
			.query()
			.select(['id'])
			.where('id', mediaID)
			.whereIn('type', mimeFilter)
			.first();
		return media ? media.id === mediaID : false;
	}
}

function isValidID(id, check) {
	return id < 0 ? true : check(id);
}

function validMediaID(database, mimeFilters) {
	return function(usage) {
		const check = checkMediaExists(database, mimeFilters[usage]);
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

function deleteTransaction(database) {
	const MediaModel = database.getModel('media');
	return function(mediaID) {
		return async function() {
			const trnx = await database.startTransaction();
			try {
				await deleteGraph(MediaModel, trnx, mediaID);
				return trnx.commit();
			} catch(err) {
				return trnx.rollback(err);
			}
		};
	};
}

function upsertTransaction(database) {
	const MediaModel = database.getModel('media');
	return function(media) {
		return async function() {
			const trnx = await database.startTransaction();
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
				return trnx.rollback(err);
			}
		};
	};
}

function fetch(database) {
	const MediaModel = database.getModel('media');
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

function controller(database, mimeFilters) {
	const getter = get(database, mimeFilters);
	return {
		upsert: upsertTransaction(database),
		available: getAll(getter),
		selected: selectAll(getter),
		validID: validMediaID(database, mimeFilters),
		list: list(database),
		delete: deleteTransaction(database),
		fetch: fetch(database)
	};
}

module.exports = controller;
