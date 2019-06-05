function mediaQuery(database) {
	return function(mimeFilter) {
		const MediaModel = database.getModel('media');
		return MediaModel
			.query()
			.select([
				'id',
				'name',
				'description',
				'type'
			])
			.whereIn('type', mimeFilter)
			.orderBy(['type', 'name']);
	}
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
	return async function(mediaID) {
		const MediaModel = database.getModel('media');
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

function controller(database, mimeFilters) {
	const getter = get(database, mimeFilters);
	return {
		available: getAll(getter),
		selected: selectAll(getter),
		validID: validMediaID(database, mimeFilters)
	};

}

module.exports = controller;
