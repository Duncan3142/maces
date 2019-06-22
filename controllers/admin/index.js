'use strict';

function index() {
	return function(req, res) {
		res.render('admin/index');
	};
}

function controller() {
	return {
		index: index()
	};
}

module.exports = controller;
