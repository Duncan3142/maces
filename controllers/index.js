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

function getMedia(mediaQueries) {
	return async function(req, res, next) {
		try {
			const unmodified = await mediaQueries.checkHash(req.params.id, req.headers['if-none-match']);
			if (unmodified) {
				res.status(304).end();
			} else {
				const media = await mediaQueries.getFile(req.params.id);
				res.setHeader('ETag', media.hash);
				res.set('Content-Type', media.type);
				res.send(media.file);
			}
		} catch(err) {
			next(err);
		}
	};
}

function about(req, res) {
	res.render('about', {headerImage: 'committee.jpg'});
}

function history(req, res) {
	res.render('history');
}

function thanks(req, res) {
	res.render('thanks');
}

function photos(req, res) {
	res.render('photos');
}

function controller(queries) {
	const eventQueries = queries.event;
	const mediaQueries = queries.media;
	return {
		index: index(eventQueries),
		about: about,
		history: history,
		thanks: thanks,
		getMedia: getMedia(mediaQueries),
		photos: photos
	};
}

// GET home page.
module.exports = controller;
