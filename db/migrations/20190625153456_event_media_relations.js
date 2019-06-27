'use strict';

exports.up = function(db) {
	return addMediaMaps(db);
};

exports.down = function(db) {
	return dropMediaMaps(db);
};

function createEventImage(db) {
	return db.schema.createTable('event_image', function (table) {
		table.increments('id');
		table.integer('event_id').unsigned();
		table.integer('media_id').unsigned();
		table.foreign('event_id', 'event_image_event_fkey').references('id').inTable('event').onDelete('CASCADE');
		table.foreign('media_id', 'event_image_media_fkey').references('id').inTable('media').onDelete('CASCADE');
	});
}

function insertEventImage(db) {
	return db.raw("insert into event_image (event_id, media_id) select event_id, media_id from event_media where usage = 'image' ");
}

function createEventDocument(db) {
	return db.schema.createTable('event_document', function (table) {
		table.increments('id');
		table.integer('event_id').unsigned();
		table.integer('media_id').unsigned();
		table.foreign('event_id', 'event_document_event_fkey').references('id').inTable('event').onDelete('CASCADE');
		table.foreign('media_id', 'event_document_media_fkey').references('id').inTable('media').onDelete('CASCADE');
	});
}

function insertEventDocument(db) {
	return db.raw("insert into event_document (event_id, media_id) select event_id, media_id from event_media where usage = 'document' ");
}

async function addMediaMaps(db) {
	try {
		await Promise.all([createEventImage(db), createEventDocument(db)]);
		await Promise.all([insertEventImage(db), insertEventDocument(db)]);
		await db.schema.dropTable('event_media');
	} catch (err) {
		console.log(err);
	}
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

async function dropMediaMaps(db) {
	try {
		await createEventMedia(db);
		await Promise.all([
			db.raw("insert into event_media (event_id, media_id, usage) select event_id, media_id, 'document' from event_document "),
			db.raw("insert into event_media (event_id, media_id, usage) select event_id, media_id, 'image' from event_image ")
		]);
		await Promise.all([db.schema.dropTable('event_image'), db.schema.dropTable('event_document')]);
	} catch (err) {
		console.log(err);
	}
}
