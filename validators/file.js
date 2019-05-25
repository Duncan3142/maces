function bufferMimeTypeMatch(file, value, fileType) {
	return file ? value === fileType(file.buffer).mime : false;
}

function mimeTypesMatcher(fileType) {
	return (value, { req }) => {
		return bufferMimeTypeMatch(req.file, value, fileType);
	};
}

function validator(buildCheckFunction, buildSanitizeFunction, fileType) {
	return {
		check: buildCheckFunction(['file']),
		filter: buildSanitizeFunction(['file']),
		typeMatch: mimeTypesMatcher(fileType)
	};
}

module.exports = validator;
