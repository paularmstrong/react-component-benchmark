import { execSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/* eslint-disable no-console */

const buildConfig = {
	bundle: true,
	sourcemap: true,
	target: ['esnext'],
	plugins: [nodeExternalsPlugin()],
};

const pkgRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(pkgRoot, 'package.json');

async function build() {
	console.time('Total');

	const { source: src, main, module: moduleFile } = require(pkgPath);
	const entryPoints = [path.resolve(pkgRoot, src)];

	console.time('module');
	await esbuild.build({
		...buildConfig,
		plugins: [
			nodeExternalsPlugin({
				packagePath: pkgPath,
			}),
		],
		entryPoints,
		format: 'esm',
		outfile: path.resolve(pkgRoot, moduleFile),
	});
	console.timeEnd('module');

	console.time('commonjs');
	await esbuild.build({
		...buildConfig,
		plugins: [
			nodeExternalsPlugin({
				packagePath: pkgPath,
			}),
		],
		entryPoints,
		format: 'cjs',
		outfile: path.resolve(pkgRoot, main),
	});
	console.timeEnd('commonjs');

	console.time('types');
	execSync('yarn tsc -b', { cwd: root });
	console.timeEnd('types');

	console.timeEnd('Total');
}

build();
