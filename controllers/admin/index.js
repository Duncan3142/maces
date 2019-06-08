function index() {
	return function(req, res) {
		res.render('admin/index', { title: 'Admin' });
	};
}

function controller() {
	return {
		index: index()
	};
}

module.exports = controller;
