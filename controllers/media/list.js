'use strict';

async function render(mediaQueries, res, next) {
	try {
		const media = await mediaQueries.list();
		res.render('admin/media', { title: 'Macmillan East Sheen Home', media });
	} catch(err) {
		next(err);
	}
}

function list(queries) {
	return async function(req, res, next) {
		const mediaQueries = queries.media;
		await render(mediaQueries, res, next);
	};
}

function controller(queries) {
	return list(queries);
}

module.exports = controller;
