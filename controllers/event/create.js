function get(queries) {
	return async function (req, res) {
		const mediaQueries = queries.media;
		const [images, documents] = await mediaQueries.available(['image', 'document']);
		res.render('admin/event_form', {title: 'Create event', images, documents});
	};
}

function post(upsert) {
	const fields = ['title','description','when','location','start','end','media'];

	return [
		// Generic validators
		...upsert.validators,
		// Execute validated upsert
		upsert.execute(fields, 'Create')
	];
}

function controller(upsert, queries) {
	return {
		get: get(queries),
		post: post(upsert)
	};
}

module.exports = controller;
