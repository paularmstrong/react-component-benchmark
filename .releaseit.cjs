'use strict';

module.exports = {
	git: {
		commitMessage: 'chore: release v${version}',
		requireCleanWorkingDir: true,
	},
	plugins: {
		'@release-it/conventional-changelog': {
			preset: {
				name: 'conventionalcommits',
				types: [
					{ type: 'fix', section: '🐞 Bug Fixes' },
					{ type: 'feat', section: '🌟 Features' },
					{ type: 'infra', section: '🏗 Internal improvements', hidden: true },
					{ type: 'perf', section: '⚡️ Performance enhanchements' },
					{ type: 'chore', section: '🧼 Chores', hidden: true },
					{ type: 'test', section: '✅ Test coverage', hidden: true },
					{ type: 'docs', section: '📚 Documentation' },
					{ type: 'refactor', section: '♻️ Refactors' },
				],
			},
			infile: 'CHANGELOG.md',
			header: '# Changelog',
		},
	},
	hooks: {
		'after:@release-it/conventional-changelog:bump': ['yarn'],
		'before:init': ['yarn build'],
	},
	npm: false,
	github: false,
};
