'use strict';

module.exports = {
	'env': {
		'commonjs': true,
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'no-console': 'off',
		'linebreak-style': [
			'error',
			'unix'
		],
		'semi': [
			'error',
			'always'
		],
		'strict': [
			'error',
			'safe'
		],
		'global-require': [
			'error'
		]
	}
};
