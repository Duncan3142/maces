function validator(param, sanitizeParam) {
	return {
		check: param,
		filter: sanitizeParam
	};
}

module.exports = validator;
