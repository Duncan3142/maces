function selectQuery(Media) {
	return Media.query()
		.select([
			'id',
			'name',
			'description',
			'type'
		])
		.orderBy('type');
}

async function render(Media, res, next) {
	try {
		const media = await selectQuery(Media);
		res.render('media', { title: 'Macmillan East Sheen Home', media });
	} catch(err) {
		next(err);
	}
}

function list(models) {
	return async function(req, res, next) {
		const Media = models.get('media');
		await render(Media, res, next);
	};
}

function controller(models) {
	return list(models);
}

module.exports = controller;
