'use strict';

module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},

	env: {
		commonjs: false,
		es6: true,
	},

	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],

	rules: {
		'no-console': 'error',
		'no-undef': 'off',
		indent: 'off', // prettier instead

		'@typescript-eslint/ban-ts-comment': 'off', // sometimes you're smarter
		'@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
	},

	settings: {
		react: {
			version: 'detect',
		},
	},

	overrides: [
		{
			files: ['**/*.test.tsx', '**/*.test.ts'],
			plugins: ['jest'],
			extends: ['plugin:jest/recommended'],
			rules: {
				'jest/consistent-test-it': ['error', { fn: 'test' }],
			},
		},
	],
};
