'use strict';

async function render(queries, res, next) {
	try {
		const eventQueries = queries.event;
		const events = await eventQueries.list();
		res.render('admin/event', { title: 'Macmillan East Sheen Home', events });
	} catch(err) {
		next(err);
	}
}

function list(queries) {
	return async function(req, res, next) {
		await render(queries, res, next);
	};
}

function controller(queries) {
	return list(queries);
}

module.exports = controller;
