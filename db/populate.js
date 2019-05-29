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

function eventMediaInsert(db, event_id, media_id, usage) {
	return db('event_media').insert({event_id, media_id, usage});
}

function deleteData(db) {
	return db('event_media').delete().then(() => Promise.all([db('event').delete(), db('media').delete()]));
}

async function populate(db) {
	try {
		await deleteData(db);
		const [mediaIDs, eventIDs] = await Promise.all([
			Promise.all([
				mediaInsert(db, 'A committee image', 'committee.jpg', 'image/jpeg', 'committee.jpg'),
				mediaInsert(db, 'A header image', 'header.jpg', 'image/jpeg', 'header.jpg'),
				mediaInsert(db, 'A guide document', 'guide.pdf', 'application/pdf', 'guide.pdf')
			]),
			Promise.all([
				eventInsert(db, 'Coffee morn', 'A coffee morning', 'May 12th', 'Tower House', new Date(2019, 7, 12), new Date(2019, 7, 12)),
				eventInsert(db, 'Bridge', 'A bridge game', 'June 1st', 'Jan Wright\'s', new Date(2019, 8, 1), new Date(2019, 8, 1)),
				eventInsert(db, 'Garden sale','A garden plant sale', 'July 23rd - July 25th', 'Sheen Lane Centre', new Date(2019, 9, 23),new Date(2019, 9, 25))
			])
		]);
		await Promise.all([
			eventMediaInsert(db, eventIDs[0][0], mediaIDs[2][0], 'flyer'),
			eventMediaInsert(db, eventIDs[1][0], mediaIDs[0][0], 'image'),
			eventMediaInsert(db, eventIDs[2][0], mediaIDs[0][0], 'image'),
			eventMediaInsert(db, eventIDs[2][0], mediaIDs[1][0], 'image')
		]);
	} catch(err) {
		console.log(err);
	} finally {
		db.destroy();
	}
}

populate(db);
