import { setAttributes, setStyles } from '../../utils'
import styles from './styles.css'

const generatePoints = (points) =>
	points.map(({ x, y }) => `${x},${-y}`).join(' ')

export default class Polyline {
	constructor(lineData, attrs = { }) {
		this.element = null
		this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
		this.element.classList.add(styles.line)
		this.data = lineData
		this.hidden = false

		setAttributes(this.element, {
			'fill': 'none',
			'stroke': lineData.color,
			'stroke-width': '1rem',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'points': generatePoints(lineData.points),
			'vector-effect': 'non-scaling-stroke',
			...attrs,
		})
	}

	updateVisibility(hidden) {
		if (this.hidden !== hidden) {
			this.hidden = hidden

			setStyles(this.element, {
				'opacity': hidden ? '0' : '1',
			})
		}
	}
}