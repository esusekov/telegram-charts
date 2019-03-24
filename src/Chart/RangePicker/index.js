import Polyline from '../Polyline'
import {DEFAULT_RANGE, htmlElement, isTouchDevice, select, setStyles} from '../../utils'
import { viewBoxAnimator } from '../../animation'
import { createRectStorage } from '../../getRect'
import styles from './styles.css'

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
	constructor({ data, onRangeUpdate, props }) {
		const { lines } = data

		this.props = { }
		this.data = data
		this.element = htmlElement(template)
		this.rect = createRectStorage(this.element)
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

		this.onUpdate(props)
		this.bindHandlers()
		this.addListeners()
	}

	onUpdate(props) {
		const { x1, x2, hiddenLines } = props

		if (x1 !== this.props.x1 || x2 !== this.props.x2) {
			setStyles(this.slider, {left: `${x1 * 100}%`, width: `${(x2 - x1) * 100}%`})
			setStyles(this.overlayLeft, {width: `calc(${x1 * 100}% + 2px)`})
			setStyles(this.overlayRight, {width: `calc(${100 - (x2 * 100)}% + 2px)`})
		}

		if (hiddenLines !== this.props.hiddenLines) {
			const max = Math.max(...this.data.lines.filter((line) => !hiddenLines[line.tag]).map((l) => l.max))

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

		this.props = props
	}

	updateRange(x1 = this.props.x1, x2 = this.props.x2) {
		if (x1 === this.props.x1 && x2 === this.props.x2) {
			return
		}

		this.onRangeUpdate(x1, x2)
	}

	getEventX(e) {
		const { left, width } = this.rect.get()
		const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0

		return (x - left) / width
	}

	handlePointerMoveLeft(e) {
		if (e.cancelable) e.preventDefault()
		e.stopPropagation()
		const touchX = this.getEventX(e)
		const x1 = Math.min(Math.max(0, touchX), this.props.x2 - DEFAULT_RANGE)

		this.updateRange(x1)
	}

	handlePointerMoveRight(e) {
		if (e.cancelable) e.preventDefault()
		e.stopPropagation()
		const touchX = this.getEventX(e)
		const x2 = Math.max(Math.min(1, touchX), this.props.x1 + DEFAULT_RANGE)

		this.updateRange(undefined, x2)
	}

	handlePointerMove(e) {
		if (e.cancelable) e.preventDefault()
		e.stopPropagation()
		const touchX = this.getEventX(e)

		if (typeof this.prevX === 'number') {
			const dx = touchX - this.prevX
			const x1 = this.props.x1 + dx
			const x2 = this.props.x2 + dx

			if (x1 > 0 && x2 < 1) {
				this.updateRange(x1, x2)
			}
		}

		this.prevX = touchX
	}

	handleDrag(e) {
		switch (e.target) {
			case this.slider:
				this.handlePointerMove(e)
				break
			case this.sliderLeftControl:
				this.handlePointerMoveLeft(e)
				break
			case this.sliderRightControl:
				this.handlePointerMoveRight(e)
				break
		}
	}

	handleDragEnd() {
		this.prevX = null
	}

	handleMouseMove(type, e) {
		if (this.dragging) {
			switch (type) {
				case 'left':
					this.handlePointerMoveLeft(e)
					break
				case 'right':
					this.handlePointerMoveRight(e)
					break
				case 'drag':
					this.handlePointerMove(e)
					break
			}
		}
	}

	handleMouseDown(type, e) {
		e.stopPropagation()
		this.dragging = true
		const moveHandler = this.handleMouseMove.bind(this, type)

		document.addEventListener('mousemove', moveHandler)
		document.addEventListener('mouseup', this.handleMouseUp)

		this.stopDragging = () => {
			document.removeEventListener('mousemove', moveHandler)
			document.removeEventListener('mouseup', this.handleMouseUp)
		}
	}

	handleMouseUp() {
		if (this.dragging) {
			this.dragging = false
			this.handleDragEnd()
			this.stopDragging()
		}
	}

	bindHandlers() {
		this.handlePointerMoveLeft = this.handlePointerMoveLeft.bind(this)
		this.handlePointerMoveRight = this.handlePointerMoveRight.bind(this)
		this.handlePointerMove = this.handlePointerMove.bind(this)
		this.handleDrag = this.handleDrag.bind(this)
		this.handleDragEnd = this.handleDragEnd.bind(this)
		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleMouseUp = this.handleMouseUp.bind(this)
		this.updateRange = this.updateRange.bind(this)
	}

	addListeners() {
		if (isTouchDevice()) {
			this.sliderLeftControl.addEventListener('touchmove', this.handleDrag)
			this.sliderRightControl.addEventListener('touchmove', this.handleDrag)
			this.slider.addEventListener('touchmove', this.handleDrag)
			this.slider.addEventListener('touchend', this.handleDragEnd)
		} else {
			this.slider.addEventListener('mousedown', this.handleMouseDown.bind(this, 'drag'))
			this.sliderLeftControl.addEventListener('mousedown', this.handleMouseDown.bind(this, 'left'))
			this.sliderRightControl.addEventListener('mousedown', this.handleMouseDown.bind(this, 'right'))
		}
	}
}