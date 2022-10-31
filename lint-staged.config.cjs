'use strict';

module.exports = {
	'*.{cjs,mjs,js,ts,tsx}': ['yarn lint --fix', () => 'yarn tsc:check'],
	'*': 'yarn format --write',
};
