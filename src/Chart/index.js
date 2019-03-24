import Polyline from './Polyline'
import RangePicker from './RangePicker'
import Grid from './Grid'
import Toggles from './Toggles'
import {select, getMaxItem, htmlElement, DEFAULT_RANGE, setStyles} from '../utils'
import { BIG_SCREEN_QUERY } from '../constants'
import { viewBoxAnimator } from '../animation'
import styles from './styles.css'

const getMax = (data, { x1, x2, hiddenLines, withTooltip }) => {
	const maxItem = getMaxItem(
		data.lines.filter((line) => !hiddenLines[line.tag]).reduce((points, l) =>
				points.concat(l.points.filter((p) => {
					const relX = p.x / l.points.length

					return relX >= x1 && relX <= x2
				})),
			[]),
		(p) => p.y
	)

	return (withTooltip ? 1.4 : 1) * maxItem.y
}

const makeTemplate = (title) => `
	<div class="${styles.container}">
		<h2 class="${styles.title}">${title}</h2>
		<div class="${styles.chart}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="${styles.lines}"
				preserveAspectRatio="none"
			></svg>
		</div>
	</div>
`

export default class Chart {
	constructor(data) {
		const { lines, title } = data

		this.state = {
			x1: 1 - DEFAULT_RANGE,
			x2: 1,
			hiddenLines: { },
			withTooltip: false,
		}

		this.state.max = getMax(data, this.state)

		this.data = data
		this.element = htmlElement(makeTemplate(title))
		this.chartElement = select(this.element, styles.chart)
		this.linesElement = select(this.element, styles.lines)
		this.setLinesShift()

		this.lines = lines.map((lineData) => new Polyline(lineData))
		this.lines.forEach((line) => this.linesElement.appendChild(line.element))

		this.bindListeners()

		this.grid = new Grid({
			props: this.state,
			data,
			onTooltipStateChange: this.onTooltipStateChange,
		})
		this.chartElement.appendChild(this.grid.element)
		this.slider = new RangePicker({ data, onRangeUpdate: this.onRangeUpdate, props: this.state })
		this.element.appendChild(this.slider.element)
		this.toggles = new Toggles({
			lines,
			onHiddenLinesUpdate: this.onHiddenLinesUpdate,
			state: this.state,
		})
		this.element.appendChild(this.toggles.element)

		const mq = window.matchMedia(BIG_SCREEN_QUERY)

		this.onMediaQueryChange(mq)
		mq.addListener(this.onMediaQueryChange)
		this.onUpdate()
	}

	bindListeners() {
		this.onRangeUpdate = this.onRangeUpdate.bind(this)
		this.onHiddenLinesUpdate = this.onHiddenLinesUpdate.bind(this)
		this.onTooltipStateChange = this.onTooltipStateChange.bind(this)
		this.onMediaQueryChange = this.onMediaQueryChange.bind(this)
	}

	setLinesShift() {
		setStyles(this.linesElement, {
			left: `${-100 * this.margin}%`,
			width: `${100 * (1 + 2 * this.margin)}%`,
		})
	}

	onHiddenLinesUpdate(hiddenLines) {
		this.updateState({ hiddenLines })
	}

	onRangeUpdate(x1, x2) {
		this.updateState({ x1, x2 })
	}

	onTooltipStateChange(withTooltip) {
		this.updateState({ withTooltip })
	}

	onMediaQueryChange(mq) {
		this.margin = mq.matches ? 0 : 0.1
		this.setLinesShift()
	}

	updateState(obj) {
		this.state = Object.assign({}, this.state, obj)
		this.state.max = getMax(this.data, this.state)

		this.grid.onUpdate(this.state)
		this.slider.onUpdate(this.state)
		this.toggles.onUpdate(this.state)
		this.onUpdate()
	}

	onUpdate() {
		const { x1, x2, max, hiddenLines } = this.state
		console.log('MAX', max)
		const margin = (x2 - x1) * this.margin
		const viewBox = {
			xMin: (x1 - margin) * this.data.width,
			xMax: (x2 - x1 + 2 * margin) * this.data.width,
			yMin: -max,
			yMax: max,
		}

		if (!this.animator) {
			this.animator = viewBoxAnimator(this.linesElement, viewBox)
		} else {
			this.animator(viewBox)
		}

		this.lines.forEach((line) => {
			line.updateVisibility(hiddenLines[line.data.tag])
		})
	}
}