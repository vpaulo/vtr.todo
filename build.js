import { readFileSync, writeFileSync } from 'fs';
import mkdirp from 'mkdirp';
import { dirname } from 'path';
import { minify } from 'terser';
import pkg from 'glob';

const { sync: globSync } = pkg;

const files = globSync('./src/**/*.js');
const options = {
	parse: {},
	compress: false,
	mangle: true,
	output: {
		ast: true,
		code: true,
		keep_quoted_props: true,
	},
	toplevel: true,
};

files.map(async file => {
	// console.log(`Minifying ${file}`);
	const terserResult = await minify(readFileSync(file, 'utf8'), options);
	if (terserResult.error) {
		console.log(`Minifying ${file} error.`, terserResult.error);
	}
	else {
		const path = file.replace('src/', 'dist/');
		mkdirp.sync(dirname(path));
		writeFileSync(path, terserResult.code, 'utf8');
		console.log(`Minifying ${path} success.`);
	}
});