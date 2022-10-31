module.exports = {
	resetMocks: true,
	roots: ['<rootDir>'],
	setupFilesAfterEnv: ['<rootDir>/scripts/setup-jest.js'],
	testEnvironment: 'jsdom',
	transform: {
		'\\.[jt]sx?$': ['esbuild-jest', { sourcemap: true }],
	},
};
