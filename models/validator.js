'use strict';

function bufferValidator(data) {
	return (data instanceof Buffer);
}

const classValidators = new Map();

classValidators.set('buffer', bufferValidator);

const keywordCompilers = [
	{
		keyword: 'class',
		compile: function(schema) {
			return classValidators.get(schema);
		}
	}
];

function addKeywords(ajv) {
	keywordCompilers.forEach(
		keywordCompiler => {
			ajv.addKeyword(keywordCompiler.keyword, { compile: keywordCompiler.compile, errors: false });
		}
	);
}

function Validator(AjvValidator) {
	return new AjvValidator({
		onCreateAjv: addKeywords,
		options: {
			allErrors: true,
			validateSchema: false,
			ownProperties: true,
			v5: true
		}
	});
}

module.exports = Validator;
