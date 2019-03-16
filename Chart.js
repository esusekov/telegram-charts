import Polyline from './Polyline'
import RangePicker from './RangePicker'
import styles from './charts.css'
import {select, setStyles, getMaxItem, htmlElement, setAttributes} from './utils'

const getMax = (data, x1, x2) => getMaxItem(
	data.lines.reduce((points, l) =>
		points.concat(l.points.filter((p) => {
			const relX = p.x / l.points.length

			return relX >= x1 && relX <= x2
		})),
	[]),
	(p) => p.y
)

const template = `
	<div class="${styles.chart}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="${styles.lines}"
			preserveAspectRatio="none"
		></svg>
	</div>
`

export default class Chart {
	constructor(data) {
		const { width, height, lines } = data

		this.data = data
		this.element = htmlElement(template)

		this.linesElement = select(this.element, styles.lines)

		setAttributes(this.linesElement, {
			viewBox: `0 0 ${width} ${height}`,
		})

		this.lines = lines
			.map((lineData) => new Polyline(lineData, { width, height }))

		this.lines.forEach((line) => this.linesElement.appendChild(line.element))

		this.onRangeUpdate = this.onRangeUpdate.bind(this)
		this.slider = new RangePicker(data, this.onRangeUpdate)
		this.element.appendChild(this.slider.element)
	}

	onRangeUpdate(x1, x2) {
		const width = 100 / (x2 - x1)

		setStyles(this.linesElement, {
			width: `${width}%`,
			transform: `translateX(${-x1 * 100}%)`
		})

		// TODO - improve code below, potentially it could be slow and no animations here
		const max = getMax(this.data, x1, x2)

		setAttributes(this.linesElement, {
			viewBox: `0 0 ${this.data.width} ${max.y}`,
		})

		this.lines.forEach((line) =>
			line.updateViewbox({ width: this.data.width, height: max.y })
		)
	}

}