function selectQuery(Media) {
	return Media.query()
		.select([
			'id',
			'name',
			'description',
			'type'
		])
		.orderBy(['type', 'name']);
}

async function render(Media, res, next) {
	try {
		const media = await selectQuery(Media);
		res.render('admin/media', { title: 'Macmillan East Sheen Home', media });
	} catch(err) {
		next(err);
	}
}

function list(database) {
	return async function(req, res, next) {
		const Media = database.getModel('media');
		await render(Media, res, next);
	};
}

function controller(database) {
	return list(database);
}

module.exports = controller;
