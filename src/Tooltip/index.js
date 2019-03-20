import styles from './styles.css'
import {htmlElement, select, setStyles} from '../utils'
import {getDate} from "../date"

const template = `
	<div class="${styles.container}">
		<div class="${styles.tooltip}">
			<div class="${styles.date}"></div>
		</div>
	</div>
`

const makePoint = ({ bottom, color }) => `
	<div class="${styles.point}" style="bottom: ${100 * bottom}%; border-color: ${color}"></div>
`

export default class Tooltip {
	constructor() {
		this.element = htmlElement(template)
		this.tooltip = select(this.element, styles.tooltip)
		this.date = select(this.element, styles.date)
	}

	// TODO - hiddenLines, tags, styling
	show({ x, lines, timestamp, hiddenLines }) {
		const xPos = 100 * x

		setStyles(this.element, { display: 'block', left: `${xPos}%` })
		this.date.textContent = getDate(timestamp)

		if (!this.points) {
			this.points = lines.map((line) => htmlElement(makePoint({ bottom: line.point, color: line.color })))
			this.points.forEach((p) => this.element.appendChild(p))
		} else {
			this.points.forEach((p, index) => setStyles(p, { bottom: `${100 * lines[index].point}%` }))
		}

	}

	hide() {
		setStyles(this.element, { display: 'none', left: `0%` })
		this.points.forEach((p) => p.remove())
		this.points = null
	}
}