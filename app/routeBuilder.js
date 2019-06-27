'use strict';

function viewHandler(isLoggedIn) {
	return function({view, requireAuth = false, args = {}}) {
		const result = [];
		if (requireAuth) {
			result.push(isLoggedIn);
		}
		result.push((req, res) => {
			res.render(view, args);
		});
		return result;
	};
}

function routeBuilder(isLoggedIn) {
	const handler = viewHandler(isLoggedIn);
	return function(route, viewDefs) {
		for (const viewDef of viewDefs) {
			route.get(viewDef.path, handler(viewDef));
		}
		return route;
	};
}

module.exports = routeBuilder;
