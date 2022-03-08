import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import html from 'rollup-plugin-fill-html'

export default {
	input: 'src/main.js',
	output: {
		file: 'dest/bundle-[hash].js',
		format: 'iife',
	},
	
	plugins: [
		postcss({
			plugins: [],
			modules: true,
		}),
		resolve(),
		html({
			template: 'src/index.html',
			filename: 'index.html'
		}),
	]
}
