'use strict';

function verbHandlerFactory(validationResult, matchedData, isLoggedIn) {
	return function(validators) {
		return function ({middleware = [], fields = [], service, requireAuth = false}) {
			if (requireAuth) {
				middleware.unshift(isLoggedIn);
			}
			return [
				...middleware,
				...validators.getFields(fields),
				async function(req, res, next) {
					try {
						const validationErrors = validationResult(req);
						if (validationErrors.isEmpty()) {
							const serviceResult = await service(matchedData());
							res.send(serviceResult);
						} else {
							res.json(validationErrors);
						}
					} catch (err) {
						next(err);
					}
				}
			];
		};
	};
}

function getMethod(router, methodName) {
	if (methodName === 'get') return router.get;
	if (methodName === 'post') return router.post;
	if (methodName === 'put') return router.put;
	if (methodName === 'delete') return router.delete;
	return router.all;
}

function routeBuilder(validatorMap, validationResult, matchedData, isLoggedIn) {
	const verbHandler = verbHandlerFactory(validationResult, matchedData, isLoggedIn);
	return function (router, {validators:validatorDefs, verbs:verbDefs}) {
		const verbs = verbDefs(verbHandler(validatorMap(validatorDefs)));
		for (const verb of verbs) {
			const method = getMethod(router, verb.name);
			method.call(router, verb.path, verb.handler);
		}
		return router;
	};
}

module.exports = routeBuilder;
