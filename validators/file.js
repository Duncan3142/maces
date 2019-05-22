function bufferMimeTypeMatch(file, value, fileType) {
	return file ? value === fileType(file.buffer).mime : false;
}

function mimeTypesMatcher(fileType) {
	return (value, { req }) => {
		return bufferMimeTypeMatch(req.file, value, fileType);
	};
}

function maxSize(max) {
	return (size) => {
		return size < max;
	};
}

function validator(buildCheckFunction, buildSanitizeFunction, fileType) {
	return {
		check: buildCheckFunction(['file']),
		filter: buildSanitizeFunction(['file']),
		typeMatch: mimeTypesMatcher(fileType),
		maxSize: maxSize
	};
}

module.exports = validator;
