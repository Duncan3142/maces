'use strict';

const fs = require('fs');
const path = require('path');
const knex = require('knex');
const connection = require('./connection.js');
const db = knex({
	client: 'pg',
	connection
});


function mediaInsert(db, description, name, type, fileName) {
	return db('media').insert({description, name, type, file: fs.readFileSync(path.resolve(__dirname, `./assets/${fileName}`))}).returning('id');
}

function eventInsert(db, title, description, when, location, start, end) {
	return db('event').insert({title, description, when, location, start, end}).returning('id');
}

function eventMediaInsert(db, event_id, media_id) {
	return db('event_media').insert({event_id, media_id});
}

function deleteData(db) {
	return db('event_media').delete().then(() => Promise.all([db('event').delete(), db('media').delete()]));
}

async function populate(db) {
	try {
		await deleteData(db);
		const [mediaIDs, eventIDs] = await Promise.all([
			Promise.all([
				mediaInsert(db, 'A bridge flyer', 'bridgeflyer.pdf', 'image', 'committee.jpg'),
				mediaInsert(db, 'A sale application form', 'saleApplication.docx', 'image', 'header.jpg')
			]),
			Promise.all([
				eventInsert(db, 'Coffee morn', 'A coffee morning', 'May 12th', 'Tower House', new Date(2019, 4, 12), new Date(2019, 4, 12)),
				eventInsert(db, 'Bridge', 'A bridge game', 'June 1st', 'Jan Wright\'s', new Date(2019, 5, 1), new Date(2019, 5, 1)),
				eventInsert(db, 'Garden sale','A garden plant sale', 'July 23rd - July 25th', 'Sheen Lane Centre', new Date(2019, 6, 23),new Date(2019, 6, 25))
			])
		]);
		await Promise.all([
			eventMediaInsert(db, eventIDs[1][0], mediaIDs[0][0]),
			eventMediaInsert(db, eventIDs[2][0], mediaIDs[0][0]),
			eventMediaInsert(db, eventIDs[2][0], mediaIDs[1][0])
		]);
	} catch(err) {
		console.log(err);
	} finally {
		db.destroy();
	}
}

populate(db);
