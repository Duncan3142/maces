'use strict';

const fs = require('fs');
const path = require('path');
const knex = require('knex');
const connection = require('./connection.js');
const bcrypt = require('bcrypt');
const adminAuth = require('../controllers/admin/auth')(bcrypt);
const db = knex({
	client: 'pg',
	connection
});

async function adminInsert(db, adminAuth, email, password) {
	const admin = {email};
	await adminAuth(admin).setPassword(password);
	return db('admin').insert(admin);
}

function mediaInsert(db, description, link_text, name, type, fileName) {
	return db('media').insert({description, link_text, name, type, file: fs.readFileSync(path.resolve(__dirname, `./assets/${fileName}`))}).returning('id');
}

function eventInsert(db, title, description, when, location, start, end) {
	return db('event').insert({title, description, when, location, start, end}).returning('id');
}

function eventMediaInsert(db, event_id, media_id, usage) {
	return db('event_media').insert({event_id, media_id, usage});
}

function deleteData(db) {
	return db('event_media').delete().then(() => Promise.all([db('event').delete(), db('media').delete(), db('admin').delete()]));
}

async function populate(db) {
	try {
		await deleteData(db);
		const [mediaIDs, eventIDs] = await Promise.all([
			Promise.all([
				mediaInsert(db, 'A committee image', 'An image of the committe', 'committee.jpg', 'image/jpeg', 'committee.jpg'),
				mediaInsert(db, 'A header image', 'A header image', 'header.jpg', 'image/jpeg', 'header.jpg'),
				mediaInsert(db, 'A guide document', 'Please see guide for more details', 'guide.pdf', 'application/pdf', 'guide.pdf')
			]),
			Promise.all([
				eventInsert(db, 'Coffee morn', 'A coffee morning', 'May 12th', 'Tower House', new Date(2019, 7, 12), new Date(2019, 7, 12)),
				eventInsert(db, 'Bridge', 'A bridge game', 'June 1st', 'Jan Wright\'s', new Date(2019, 8, 1), new Date(2019, 8, 1)),
				eventInsert(db, 'Garden sale','A garden plant sale', 'July 23rd - July 25th', 'Sheen Lane Centre', new Date(2019, 9, 23),new Date(2019, 9, 25))
			]),
			adminInsert(db, adminAuth, 'admin@maces.com', process.env.MACES_ADMIN_PASSWORD)
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
