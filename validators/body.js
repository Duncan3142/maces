function validator(body, sanitizeBody) {
	return {
		check: body,
		filter: sanitizeBody
	};
}

module.exports = validator;
