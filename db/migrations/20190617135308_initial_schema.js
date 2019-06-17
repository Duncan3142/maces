'use strict';

function createAdmin(db) {
	return db.schema.createTable('admin', function (table) {
		table.increments('id');
		table.text('email');
		table.text('hash');
		table.index('email', 'admin_email_idx');
		table.index('hash', 'admin_hash_idx');
	});
}

function createEvent(db) {
	return db.schema.createTable('event', function (table) {
		table.increments('id');
		table.text('title');
		table.text('description');
		table.text('when');
		table.text('location');
		table.datetime('start');
		table.datetime('end');
		table.index('start', 'event_start_idx');
		table.index('end', 'event_end_idx');
	});
}

function createMedia(db) {
	return db.schema.createTable('media', function (table) {
		table.increments('id');
		table.text('description');
		table.text('link_text');
		table.text('name');
		table.text('type');
		table.binary('file');
		table.text('hash');
		table.index('type', 'media_type_idx');
		table.index('hash', 'media_hash_idx');
	});
}

function createEventMedia(db) {
	return db.schema.createTable('event_media', function (table) {
		table.increments('id');
		table.integer('event_id').unsigned();
		table.integer('media_id').unsigned();
		table.text('usage');
		table.index('usage', 'event_media_usage_idx');
		table.foreign('event_id', 'event_media_event_fkey').references('id').inTable('event');
		table.foreign('media_id', 'event_media_media_fkey').references('id').inTable('media');
	});
}

async function createSchema(db) {
	try {
		await Promise.all([createEvent(db), createMedia(db), createAdmin(db)]);
		await Promise.all([createEventMedia(db)]);
	} catch (err) {
		console.log(err);
	}
}

exports.up = function(db) {
	return createSchema(db);
};

async function dropSchema(db) {
	try {
		await Promise.all([db.schema.dropTable('admin'), await db.schema.dropTable('event_media')]);
		await Promise.all([db.schema.dropTable('event'), db.schema.dropTable('media')]);
	} catch (err) {
		console.log(err);
	}
}

exports.down = function(db) {
	return dropSchema(db);
};
