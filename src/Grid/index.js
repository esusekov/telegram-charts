import styles from './styles.css'
import { htmlElement, select } from '../utils'

const template = `
	<div class="${styles.grid}">
		<div class="${styles.yAxis}"></div>
		<div class="${styles.xAxis}"></div>
	</div>
`

const makeYAxis = (data) => `
	<div class="${styles.yAxisItems}">
		${data.map((value, index) => `
			<div class="${styles.yAxisItem}" style="transform: translateY(-${index * (100 / data.length)}%)">${value}</div>
		`).join('')}
	</div>
`

const digitsCount = (num) => {
	return (Math.log10((num ^ (num >> 31)) - (num >> 31)) | 0) + 1;
}

const getYItems = (max) => {
	const digits = digitsCount(max)
	const divider = Math.pow(10, Math.max(0, digits - 2))
	let targetMax = Math.floor(max / divider) * divider
	const step = Math.floor(targetMax / 5)

	return [0, step, 2 * step, 3 * step, 4 * step, 5 * step]
}

export default class Grid {
	constructor({ x1, x2, max }) {
		this.element = htmlElement(template)
		this.yAxis = select(this.element, styles.yAxis)
		this.xAxis = select(this.element, styles.xAxis)
		this.max = max
		this.renderY(max)
	}

	updateMax(max) {
		if (max !== this.max) {
			this.renderY(max)
		}
	}

	renderY(max) {
		if (this.yAxisItems) {
			this.yAxisItems.remove()
		}

		const data = getYItems(max)
		console.log('Y', max, data)
		this.yAxisItems = htmlElement(makeYAxis(data))
		this.yAxis.appendChild(this.yAxisItems)
	}

	renderX() {

	}
}