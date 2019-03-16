import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'

export default {
	plugins: [
		postcss({
			plugins: [],
			modules: true,
		}),
		resolve(),
	]
}