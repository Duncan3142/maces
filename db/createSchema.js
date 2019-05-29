'use strict';

const knex = require('knex');
const connection = require('./connection.js');
const db = knex({
	client: 'pg',
	connection
});

function createEvent(db) {
	return db.schema.createTable('event', function (table) {
		table.increments('id');
		table.string('title');
		table.string('description');
		table.string('when');
		table.string('location');
		table.datetime('start');
		table.datetime('end');
		table.index('start', 'event_start_idx');
		table.index('end', 'event_end_idx');
		table.timestamps();
	});
}

function createMedia(db) {
	return db.schema.createTable('media', function (table) {
		table.increments('id');
		table.string('description');
		table.string('name');
		table.string('type');
		table.binary('file');
		table.timestamps();
	});
}

function createEventMedia(db) {
	return db.schema.createTable('event_media', function (table) {
		table.increments('id');
		table.integer('event_id').unsigned();
		table.integer('media_id').unsigned();
		table.string('usage');
		table.foreign('event_id', 'event_media_event_fkey').references('id').inTable('event');
		table.foreign('media_id', 'event_media_media_fkey').references('id').inTable('media');
		table.timestamps();
	});
}

async function createSchema(db) {
	try {
		await db.schema.dropTableIfExists('event_media');
		await Promise.all([db.schema.dropTableIfExists('event'), db.schema.dropTableIfExists('media')]);
		await Promise.all([createEvent(db), createMedia(db)]);
		await createEventMedia(db);
	} catch (err) {
		console.log(err);
	} finally {
		db.destroy();
	}
}

createSchema(db);
