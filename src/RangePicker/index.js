import styles from './styles.css'
import { htmlElement, select, setAttributes, setStyles } from '../utils'
import Polyline from '../Polyline'
import {viewBoxAnimator} from "../animation"

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
	constructor(data, onRangeUpdate, state) {
		const { width, height, lines } = data

		this.data = data
		this.state = state
		this.element = htmlElement(template)
		this.onRangeUpdate = onRangeUpdate
		this.chartElement = select(this.element, styles.chart)

		this.lines = lines
			.map((lineData) => new Polyline(lineData, { 'stroke-width': '0.5rem' }))

		this.lines.forEach((line) => this.chartElement.appendChild(line.element))

		this.slider = select(this.element, styles.slider)
		this.sliderLeftControl = select(this.element, styles.sliderLeftControl)
		this.sliderRightControl = select(this.element, styles.sliderRightControl)
		this.overlayLeft = select(this.element, styles.overlayLeft)
		this.overlayRight = select(this.element, styles.overlayRight)

		this.onUpdate(this.state)
		this.bindHandlers()
		this.addListeners()
	}

	onUpdate(state) {
		this.state = state

		const { x1, x2, hiddenLines } = state
		const max = Math.max(...this.data.lines.filter((line) => !hiddenLines[line.tag]).map((l) => l.max))

		setStyles(this.slider, { left: `${x1 * 100}%`, width: `${(x2 - x1) * 100}%` })
		setStyles(this.overlayLeft, { width: `${x1 * 100}%` })
		setStyles(this.overlayRight, { width: `${100 - (x2 * 100)}%` })

		const viewBox = {
			xMin: 0,
			xMax: this.data.width,
			yMin: -max,
			yMax: max,
		}

		if (!this.animator) {
			this.animator = viewBoxAnimator(this.chartElement, viewBox)
		} else {
			this.animator(viewBox)
		}

		this.lines.forEach((line) => line.updateVisibility(hiddenLines[line.data.tag]))
	}

	updateRange(x1 = this.state.x1, x2 = this.state.x2) {
		if (x1 === this.state.x1 && x2 === this.state.x2) {
			return
		}

		this.onRangeUpdate(x1, x2)
	}

	handleDragLeft(e) {
		if (e.target === this.sliderLeftControl) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth
			const x1 = Math.min(Math.max(0, touchX), this.state.x2 - 0.1)

			this.updateRange(x1)
		}
	}

	handleDragRight(e) {
		if (e.target === this.sliderRightControl) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth
			const x2 = Math.max(Math.min(1, touchX), this.state.x1 + 0.1)

			this.updateRange(undefined, x2)
		}
	}

	handleDrag(e) {
		if (e.target === this.slider) {
			const touchX = e.touches[0].clientX / this.element.offsetWidth

			if (typeof this.prevX === 'number') {
				const dx = touchX - this.prevX
				const x1 = this.state.x1 + dx
				const x2 = this.state.x2 + dx

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