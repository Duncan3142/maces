'use strict';

function classValidator(Class) {
	return (data) => data instanceof Class;
}

const classValidators = new Map();

classValidators.set('buffer', classValidator(Buffer));
classValidators.set('date', classValidator(Date));

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
