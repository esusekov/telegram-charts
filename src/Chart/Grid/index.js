import styles from './styles.css'
import { htmlElement, select, setStyles, debounce } from '../../utils'
import { getDate } from '../../date'
import Tooltip from '../Tooltip/index'
import {createRectStorage} from "../../getRect"

const template = `
	<div class="${styles.grid}">
		<div class="${styles.yAxis}"></div>
		<div class="${styles.xAxis}"></div>
	</div>
`

const makeYAxis = (data, scale) => `
	<div class="${styles.yAxisItems}" style="transform: scaleY(${scale})">
		${data.map((value, index) => `
			<div class="${styles.yAxisItem}" style="transform: translateY(-${index * (100 / data.length)}%)">${value}</div>
		`).join('')}
	</div>
`

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

	return { step: scale * initialStep, minStep: initialStep }
}

export default class Grid {
	constructor(data, { x1, x2, max, hiddenLines }) {
		this.element = htmlElement(template)
		this.yAxis = select(this.element, styles.yAxis)
		this.xAxis = select(this.element, styles.xAxis)
		this.max = max
		this.x1 = x1
		this.x2 = x2
		this.hiddenLines = hiddenLines
		this.data = data

		this.bindHandlers()
		this.renderY = debounce(this.renderY, 200)
		this.renderY(max)
		this.initX()
		this.renderX(x1, x2)

		this.tooltip = new Tooltip()
		this.element.appendChild(this.tooltip.element)

		this.rect = createRectStorage(this.element)
		this.element.addEventListener('mousemove', this.handlePointerOver)
		this.element.addEventListener('mouseleave', this.handlePointerOut)
		this.element.addEventListener('touchstart', this.handlePointerOver)
		this.element.addEventListener('touchmove', this.handlePointerOver)
		this.element.addEventListener('touchend', this.handlePointerOut)
	}

	bindHandlers() {
		this.renderY = this.renderY.bind(this)
		this.handlePointerOver = this.handlePointerOver.bind(this)
		this.handlePointerOut = this.handlePointerOut.bind(this)
	}

	onUpdate({ x1, x2, max, hiddenLines }) {
		this.hiddenLines = hiddenLines

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

	handlePointerOver(e) {
		const rect = this.rect.get()
		const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0
		const relativeX = Math.min(Math.max(x / rect.width, 0), 1)
		const index = Math.round(((this.x2 - this.x1) * relativeX + this.x1) * this.data.width)
		const coord = (index  / this.data.width - this.x1) / (this.x2 - this.x1)

		this.tooltip.show({
			x: coord,
			hiddenLines: this.hiddenLines,
			timestamp: this.data.timestamps[index],
			lines: this.data.lines.map(({ points, ...l }) => ({
				...l,
				point: points[index].y / this.max,
				value: points[index].y,
			})),
			rect,
		})
	}

	handlePointerOut() {
		this.tooltip.hide()
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
		const { step, minStep } = getStep(timestamps.length, x1, x2)

		this.timestamps.forEach((node, index) => {
			const visible = (index >= first && index <= last) && (timestamps.length - index) % minStep === 0
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

	renderY(max) {
		const prevItems = this.yAxisItems

		const data = getYItems(max)
		this.yAxisItems = {
			element: htmlElement(makeYAxis(data, max / (prevItems ? prevItems.max : max))),
			max,
		}
		this.yAxis.appendChild(this.yAxisItems.element)

		const newElement = this.yAxisItems.element

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setStyles(newElement, {
					transform: `scaleY(1)`,
					opacity: '1',
				})

				if (prevItems) {
					setStyles(prevItems.element, {
						transform: `scaleY(${prevItems.max / max})`,
						opacity: '0',
					})

					prevItems.element.addEventListener("transitionend", () => prevItems.element.remove(), false)
				}
			})
		})
	}
}