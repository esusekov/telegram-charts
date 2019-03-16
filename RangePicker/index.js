import styles from './styles.css'
import { htmlElement, select, setAttributes, setStyles } from '../utils'
import Polyline from '../Polyline'

const template = `
	<div class="${styles.picker}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="${styles.chart}"
			preserveAspectRatio="none"
		></svg>
		<div class="${styles.overlayLeft}"></div>
		<div class="${styles.slider}">
			<div class="${styles.sliderLeftControl}"></div>
			<div class="${styles.sliderRightControl}"></div>
		</div>
		<div class="${styles.overlayRight}"></div>
	</div>
`

export default class RangePicker {
	constructor(data, onRangeUpdate) {
		const { width, height, lines } = data

		this.element = htmlElement(template)
		this.onRangeUpdate = onRangeUpdate
		this.chartElement = select(this.element, styles.chart)

		setAttributes(this.chartElement, {
			viewBox: `0 0 ${width} ${height}`,
		})

		lines
			.map((lineData) => new Polyline(lineData, { width, height }, { 'stroke-width': '2px' }))
			.forEach((line) => this.chartElement.appendChild(line.element))

		this.slider = select(this.element, styles.slider)
		this.sliderLeftControl = select(this.element, styles.sliderLeftControl)
		this.sliderRightControl = select(this.element, styles.sliderRightControl)
		this.overlayLeft = select(this.element, styles.overlayLeft)
		this.overlayRight = select(this.element, styles.overlayRight)

		this.updateRange(0.9, 1)
		this.bindHandlers()
		this.addListeners()
	}

	updateRange(x1 = this.x1, x2 = this.x2) {
		if (x1 === this.x1 && x2 === this.x2) {
			return
		}

		this.x1 = x1
		this.x2 = x2

		setStyles(this.slider, { left: `${x1 * 100}%`, width: `${(x2 - x1) * 100}%` })
		setStyles(this.overlayLeft, { width: `${x1 * 100}%` })
		setStyles(this.overlayRight, { width: `${100 - (x2 * 100)}%` })

		this.onRangeUpdate(x1, x2)
	}

	handleDragLeft(e) {
		if (e.target === this.sliderLeftControl) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth
			const x1 = Math.min(Math.max(0, touchX), this.x2 - 0.1)

			this.updateRange(x1)
		}
	}

	handleDragRight(e) {
		if (e.target === this.sliderRightControl) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth
			const x2 = Math.max(Math.min(1, touchX), this.x1 + 0.1)

			this.updateRange(undefined, x2)
		}
	}

	handleDrag(e) {
		if (e.target === this.slider) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth

			if (typeof this.prevX === 'number') {
				const dx = touchX - this.prevX
				const x1 = this.x1 + dx
				const x2 = this.x2 + dx

				if (x1 > 0 && x2 < 1) {
					this.updateRange(x1, x2)
				}
			}

			this.prevX = touchX
		}
	}

	handleDragEnd() {
		this.prevX = null
	}

	bindHandlers() {
		this.handleDragLeft = this.handleDragLeft.bind(this)
		this.handleDragRight = this.handleDragRight.bind(this)
		this.handleDrag = this.handleDrag.bind(this)
		this.handleDragEnd = this.handleDragEnd.bind(this)
		this.updateRange = this.updateRange.bind(this)
	}

	addListeners() {
		// TODO - implement mouse events
		this.sliderLeftControl.addEventListener('touchmove', this.handleDragLeft)
		this.sliderRightControl.addEventListener('touchmove', this.handleDragRight)
		this.slider.addEventListener('touchmove', this.handleDrag)
		this.slider.addEventListener('touchend', this.handleDragEnd)
	}
}