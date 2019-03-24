import {htmlElement, select, setStyles, debounce, isTouchDevice, DEFAULT_RANGE, formatValue} from '../../utils'
import { getDate } from '../../date'
import Tooltip from '../Tooltip'
import { createRectStorage } from '../../getRect'
import styles from './styles.css'

const template = `
	<div class="${styles.grid}">
		<div class="${styles.yAxis}"></div>
		<div class="${styles.xAxis}"></div>
	</div>
`

const makeYAxis = (rect, data, max, scale) => `
	<div class="${styles.yAxisItems}" style="transform: scaleY(${scale})">
		${data.map((value) => `
			<div
				class="${styles.yAxisItem}" 
				style="transform: translateY(-${rect.height * value / max}px)"
			>
				${formatValue(value)}
			</div>
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
	const downscaledMax = 0.9 * max
	const digits = digitsCount(downscaledMax)
	const divider = Math.pow(10, Math.max(0, digits - 2))
	const targetMax = Math.floor(downscaledMax / divider) * divider
	const step = Math.floor(targetMax / 5)

	return [0, step, 2 * step, 3 * step, 4 * step, 5 * step]
}

function nearestPow2(num) {
	return Math.pow(2, Math.round(Math.log(num) / Math.log(2)))
}

const getStep = (tsCount, x1, x2) => {
	const initialStep = Math.round(DEFAULT_RANGE * tsCount / 5)
	const calculatedStep = Math.round((x2 - x1) * tsCount / 5)
	const scale = nearestPow2(calculatedStep / initialStep) || 1

	return { step: scale * initialStep, minStep: initialStep }
}

export default class Grid {
	constructor({ props, data, onTooltipStateChange }) {
		this.props = props
		this.data = data
		this.onTooltipStateChange = onTooltipStateChange
		this.element = htmlElement(template)
		this.yAxis = select(this.element, styles.yAxis)
		this.xAxis = select(this.element, styles.xAxis)

		this.bindHandlers()
		this.initX()
		this.renderY = debounce(this.renderY, 200)
		this.renderY()
		this.renderX()
		this.tooltip = new Tooltip()
		this.element.appendChild(this.tooltip.element)
		this.rect = createRectStorage(this.element)
		this.addEventListeners()
	}

	bindHandlers() {
		this.renderY = this.renderY.bind(this)
		this.handlePointerOver = this.handlePointerOver.bind(this)
		this.handlePointerOut = this.handlePointerOut.bind(this)
		this.handleTouch = this.handleTouch.bind(this)
		this.handleTouchEnd = this.handleTouchEnd.bind(this)
		this.handleMouseMove = this.handleMouseMove.bind(this)
	}

	addEventListeners() {
		if (isTouchDevice()) {
			this.element.addEventListener('touchstart', this.handleTouch)
			this.element.addEventListener('touchmove', this.handleTouch)
			this.element.addEventListener('touchend', this.handleTouchEnd)
		} else {
			this.element.addEventListener('mousemove', this.handleMouseMove)
			this.element.addEventListener('mouseleave', this.handlePointerOut)
		}
	}

	onUpdate(props) {
		const { x1, x2, max } = this.props
		this.props = props

		if (max !== this.props.max) {
			this.renderY()
		}

		if (x1 !== this.props.x1 || x2 !== this.props.x2) {
			this.renderX()
		}
	}

	handleTouch(e) {
		if (this.touch) {
			this.handlePointerOver(e)
		} else if (!this.touchId) {
			this.touchId = setTimeout(() => {
				this.touch = true
				this.handlePointerOver(e)
			}, 100)
		}
	}

	handleTouchEnd() {
		clearTimeout(this.touchId)
		this.touch = false
		this.touchId = null
		this.handlePointerOut()
	}

	handleMouseMove(e) {
		this.handlePointerOver(e)
	}

	handlePointerOver(e) {
		if (e.cancelable) e.preventDefault()
		e.stopPropagation()

		const rect = this.rect.get()
		const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0
		const relativeX = Math.min(Math.max((x - rect.left) / rect.width, 0), 1)
		const index = Math.round(((this.props.x2 - this.props.x1) * relativeX + this.props.x1) * this.data.width)
		const coord = (index  / this.data.width - this.props.x1) / (this.props.x2 - this.props.x1)

		if (!this.props.withTooltip) {
			this.onTooltipStateChange(true)
		}

		this.tooltip.show({
			x: coord,
			hiddenLines: this.props.hiddenLines,
			timestamp: this.data.timestamps[index],
			lines: this.data.lines.map(({ points, ...l }) => ({
				...l,
				point: points[index].y / this.props.max,
				value: points[index].y,
			})),
			rect,
		})
	}

	handlePointerOut() {
		this.tooltip.hide()

		if (this.props.withTooltip) {
			this.onTooltipStateChange(false)
		}
	}

	initX() {
		const { timestamps } = this.data

		this.timestamps = timestamps.map((ts, index) => htmlElement(makeXItem(ts, index / (timestamps.length - 1))))
		this.timestamps.forEach((node) => this.xAxis.appendChild(node))
	}

	renderX() {
		const { x1, x2 } = this.props
		const { timestamps } = this.data
		const width = 100 / (x2 - x1)
		const first = Math.max(Math.round(x1 * timestamps.length), 0)
		const last = Math.min(Math.round(x2 * timestamps.length), timestamps.length - 1)
		const { step, minStep } = getStep(timestamps.length, x1, x2)

		this.timestamps.forEach((node, index) => {
			const visible = ((index + 2) >= first && (index - 2) <= last) && (timestamps.length - index - 2) % minStep === 0
			node.style.display = visible ? 'flex' : 'none'

			if (visible && (timestamps.length - index - 2) % step === 0) {
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

	renderY() {
		const rect = this.rect.get()
		const { max } = this.props
		const prevItems = this.yAxisItems
		const scale = max / (prevItems ? prevItems.max : max)

		const data = getYItems(max)
		this.yAxisItems = {
			element: htmlElement(makeYAxis(rect, data, max, scale)),
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

					prevItems.element.addEventListener('transitionend', () => prevItems.element.remove(), false)
				}
			})
		})
	}
}