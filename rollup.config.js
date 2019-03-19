import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'iife',
	},
	plugins: [
		postcss({
			plugins: [],
			modules: true,
		}),
		resolve(),
	]
}