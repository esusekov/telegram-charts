import styles from './styles.css'
import {htmlElement, select, setStyles} from '../utils'

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

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getDate = (ts) => {
	const date = new Date(ts)

	return `${months[date.getMonth()]} ${date.getDate()}`
}

const makeXItem = (timestamp, x) => `
	<div 
		class="${styles.xAxisItem}" 
		style="left: ${x * 100}%"
	>
		${getDate(timestamp)}
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

function nearestPow2(num) {
	return Math.pow(2, Math.round(Math.log(num) / Math.log(2)))
}

const getStep = (tsCount, x1, x2) => {
	const initialStep = Math.floor(0.1 * tsCount / 5)
	const calculatedStep = Math.floor((x2 - x1) * tsCount / 5)
	const scale = nearestPow2(calculatedStep / initialStep) || 1

	return scale * initialStep
}

export default class Grid {
	constructor(data, { x1, x2, max }) {
		this.element = htmlElement(template)
		this.yAxis = select(this.element, styles.yAxis)
		this.xAxis = select(this.element, styles.xAxis)
		this.max = max
		this.x1 = x1
		this.x2 = x2
		this.data = data
		this.renderY(max)
		this.initX()
		this.renderX(x1, x2)
	}

	onUpdate({ x1, x2, max }) {
		if (max !== this.max) {
			this.max = max
			this.renderY(max)
		}

		if (x1 !== this.x1 || x2 !== this.x2) {
			this.x1 = x1
			this.x2 = x2
			this.renderX(x1, x2)
		}
	}

	renderY(max) {
		if (this.yAxisItems) {
			this.yAxisItems.remove()
		}

		const data = getYItems(max)
		this.yAxisItems = htmlElement(makeYAxis(data))
		this.yAxis.appendChild(this.yAxisItems)
	}

	initX() {
		const { timestamps } = this.data

		this.timestamps = timestamps.map((ts, index) => htmlElement(makeXItem(ts, index / timestamps.length)))
		this.timestamps.forEach((node) => this.xAxis.appendChild(node))
	}

	renderX(x1, x2) {
		const { timestamps } = this.data
		const width = 100 / (x2 - x1)
		const first = Math.max(Math.ceil(x1 * timestamps.length), 0)
		const last = Math.min(Math.floor(x2 * timestamps.length), timestamps.length - 1)
		const step = getStep(timestamps.length, x1, x2)

		this.timestamps.forEach((node, index) => {
			const visible = (index >= first && index <= last)
			node.style.display = visible ? 'flex' : 'none'

			if (visible && (timestamps.length - index) % step === 0) {
				node.style.opacity = '1'
			} else {
				node.style.opacity = '0'
			}
		})

		setStyles(this.xAxis, {
			width: `${width}%`,
			transform: `translateX(${-x1 * 100}%)`
		})
	}
}