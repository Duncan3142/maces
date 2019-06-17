'use strict';

const fs = require('fs');
const bcrypt = require('bcrypt');
const adminAuth = require('../../controllers/admin/auth')(bcrypt);
const crypto = require('crypto');

async function adminInsert(db, adminAuth, email, password) {
	const admin = {email};
	await adminAuth(admin).setPassword(password);
	return db('admin').insert(admin);
}

function mediaInsert(db, description, link_text, fileName, type) {
	const file = fs.readFileSync(`./assets/${fileName}`);
	const hash = crypto.createHash('md5').update(file).digest('hex');
	return db('media').insert({description, link_text, name: fileName, type, file, hash}).returning('id');
}

function eventInsert(db, title, description, when, location, start, end) {
	return db('event').insert({title, description, when, location, start, end}).returning('id');
}

function eventMediaInsert(db, event_id, media_id, usage) {
	return db('event_media').insert({event_id, media_id, usage});
}

async function deleteData(db) {
	try {
		await db('event_media').delete().then(() => Promise.all([db('event').delete(), db('media').delete(), db('admin').delete()]));
	} catch(err) {
		console.log(err);
	}
}

async function populate(db) {
	try {
		const [[carolImage, carolFlyer, walkForm, coffeeImage, coffeeFlyer], [carols, flagDay, walk, coffee]] = await Promise.all([
			Promise.all([
				mediaInsert(db, 'Carol Picture', 'An Xmas Image', 'xmas-carols.jpg', 'image/jpeg'),
				mediaInsert(db, 'Xmas Carols Flyer', 'Please see flyer for more details.', 'xmax-carol.pdf', 'application/pdf'),
				mediaInsert(db, 'Fitzrovia walk booking form', 'Please fill in booking form and return.', 'fitzrovia-walk-booking-form.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
				mediaInsert(db, 'Coffee Morning Image', 'An image of a coffee morning', 'coffee-morn.jpg', 'image/jpeg'),
				mediaInsert(db, 'Coffee Morning Flyer', 'See flyer for more details.', 'coffee-morn.pdf', 'application/pdf')
			]),
			Promise.all([
				eventInsert(db, "Carol Concert", `Let's sing carols together!
				With carols for choir, carols for all, festive readings with the Howells Singers, conductor Richard Lyne, organist James Cryer and Skyline Brass.
				Tickets £10 on the door, followed by mulled wine.`, "Sat December 7th 6pm-8pm", "All Saints Church, East Sheen Ave, SW14 8AX", new Date(2019, 12, 7), new Date(2019, 12, 8)),
				eventInsert(db, "Flag Day", `We shall be collecting on our National Day outside Waitrose in Sheen and Mortlake Station. I would love to hear from anyone who would be willing to help for an hour or 2, so please email us.`, "11th July", "East Sheen", new Date(2019, 7, 11), new Date(2019, 7, 12)),
				eventInsert(db, "FITZROVIA Walk 'Paupers, Princes, Physicians' & 'A Very Public Scandal'", `The lovely Amanda McKerracher is again leading 2 fascinating London walks, entitled 'Paupers, Princes, Physicians' & 'A Very Public Scandal'. All of Amanda's previous walks have been really excellent.
				Cost £15 and of course ALL proceeds to Macmillan Cancer Support. Places are limited.`, "Thurs July 4th morning (10:50am) and afternoon (2:00pm)", "Fitzrovia", new Date(2019, 7, 4), new Date(2019, 7, 5)),
				eventInsert(db, "World's Biggest Coffee Morning", `Please join us for our annual WBCM for coffee, cakes, home produce, bric-a-brac, garden plants and secondhand paperbacks.
				If you have bric-a-brac or home produce to donate then please email us. And we would LOVE you to bake us a cake if at all possible!!!
				We can sell as many cakes as you can bake, so please let us know if you can help.`, "Sat September 7th 9.30am-1:00pm.", "Tower House School, Sheen Lane", new Date(2019, 9, 7), new Date(2019, 9, 8))
			]),
			adminInsert(db, adminAuth, process.env.MACES_USERNAME, process.env.MACES_PASSWORD)
		]);
		await Promise.all([
			eventMediaInsert(db, carols[0], carolFlyer[0], 'document'),
			eventMediaInsert(db, carols[0], carolImage[0], 'image'),
			eventMediaInsert(db, walk[0], walkForm[0], 'document'),
			eventMediaInsert(db, coffee[0], coffeeFlyer[0], 'document'),
			eventMediaInsert(db, coffee[0], coffeeImage[0], 'image')
		]);
	} catch(err) {
		console.log(err);
	}
}

exports.up = function(db) {
	return populate(db);
};

exports.down = function(db) {
	return deleteData(db);
};
