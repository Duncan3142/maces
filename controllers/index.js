'use strict';

function index(eventQueries) {
	return async function(req, res, next) {
		try {
			const events = await eventQueries.upcoming();
			res.render('index', { title: 'Macmillan East Sheen Home', events });
		} catch(err) {
			next(err);
		}
	};
}

function about(req, res) {
	res.render('about');
}

function history(req, res) {
	res.render('history');
}

function thanks(req, res) {
	res.render('thanks');
}

function controller(eventQueries) {
	return {
		index: index(eventQueries),
		about: about,
		history: history,
		thanks: thanks
	};
}

// GET home page.
module.exports = controller;
