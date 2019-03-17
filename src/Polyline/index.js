import { setAttributes } from '../utils'

const generatePoints = (points, { height }) =>
	points.map(({ x, y }) => `${x},${height - y}`).join(' ')

export default class Polyline {
	constructor(lineData, viewBox, attrs = { }) {
		this.element = null
		this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
		this.data = lineData

		setAttributes(this.element, {
			'fill': 'none',
			'stroke': lineData.color,
			'stroke-width': '5px',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'points': generatePoints(lineData.points, viewBox),
			'vector-effect': 'non-scaling-stroke',
			...attrs,
		})
	}

	updateViewbox(viewBox) {
		setAttributes(this.element, {
			'points': generatePoints(this.data.points, viewBox),
		})
	}
}