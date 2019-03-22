import Polyline from './Polyline'
import RangePicker from './RangePicker'
import Grid from './Grid'
import { select, getMaxItem, htmlElement } from '../utils'
import { viewBoxAnimator } from '../animation'
import styles from './styles.css'
import Toggles from "./Toggles"

const getMax = (data, { x1, x2, hiddenLines }) => getMaxItem(
	data.lines.filter((line) => !hiddenLines[line.tag]).reduce((points, l) =>
		points.concat(l.points.filter((p) => {
			const relX = p.x / l.points.length

			return relX >= x1 && relX <= x2
		})),
	[]),
	(p) => p.y
)

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
			x1: 0.9,
			x2: 1,
			hiddenLines: { },
		}

		this.state.max = getMax(data, this.state).y

		this.data = data
		this.element = htmlElement(makeTemplate(title))

		this.chartElement = select(this.element, styles.chart)
		this.linesElement = select(this.element, styles.lines)

		this.lines = lines.map((lineData) => new Polyline(lineData))
		this.lines.forEach((line) => this.linesElement.appendChild(line.element))

		this.grid = new Grid(data, this.state)
		this.chartElement.appendChild(this.grid.element)

		this.onRangeUpdate = this.onRangeUpdate.bind(this)
		this.slider = new RangePicker(data, this.onRangeUpdate, this.state)
		this.element.appendChild(this.slider.element)

		this.onHiddenLinesUpdate = this.onHiddenLinesUpdate.bind(this)
		this.toggles = new Toggles({
			lines,
			onHiddenLinesUpdate: this.onHiddenLinesUpdate,
			state: this.state,
		})
		this.element.appendChild(this.toggles.element)

		this.onUpdate()
	}

	onHiddenLinesUpdate(hiddenLines) {
		this.updateState({ hiddenLines })
	}

	onRangeUpdate(x1, x2) {
		this.updateState({ x1, x2 })
	}

	updateState(obj) {
		this.state = Object.assign({}, this.state, obj)
		this.state.max = getMax(this.data, this.state).y

		this.grid.onUpdate(this.state)
		this.slider.onUpdate(this.state)
		this.toggles.onUpdate(this.state)
		this.onUpdate()
	}

	onUpdate() {
		const { x1, x2, max, hiddenLines } = this.state
		const margin = (x2 - x1) * 0.1
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