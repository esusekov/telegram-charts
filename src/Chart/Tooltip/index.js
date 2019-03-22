import styles from './styles.css'
import { htmlElement, select, setStyles, formatValue } from '../../utils'
import { getWeekDate } from '../../date'
import { getRect } from '../../getRect'

const template = `
	<div class="${styles.container}">
		<div class="${styles.tooltip}">
			<div class="${styles.date}"></div>
			<div class="${styles.desc}"></div>
		</div>
	</div>
`

const pointTemplate = `<div class="${styles.point}"></div>`
const descItemTemplate = `<div class="${styles.descItem}"></div>`

const makeDescItemContent = ({ value, name }) => `
	<div class="${styles.value}">${formatValue(value)}</div>
	<div class="${styles.tag}">${name}</div>
`

const tooltipHeight = 0.25
const tooltipGap = 0.02

export default class Tooltip {
	constructor() {
		this.element = htmlElement(template)
		this.tooltip = select(this.element, styles.tooltip)
		this.date = select(this.element, styles.date)
		this.desc = select(this.element, styles.desc)
	}

	show({ x, lines, timestamp, hiddenLines, rect }) {
		setStyles(this.element, { display: 'block', left: `${100 * x}%` })

		if (!this.points) {
			this.points = lines.map(() => htmlElement(pointTemplate))
			this.points.forEach((p) => this.element.appendChild(p))
		}

		this.date.textContent = getWeekDate(timestamp)

		if (!this.items) {
			this.items = lines.map(() => htmlElement(descItemTemplate))
			this.items.forEach((i) => this.desc.appendChild(i))
		}

		lines.forEach((line, index) => {
			const point = this.points[index]
			const item = this.items[index]
			const hidden = Boolean(hiddenLines[line.tag])

			setStyles(point, {
				display: hidden ? 'none' : 'block',
				borderColor: line.color,
				bottom: `${100 * line.point}%`
			})
			setStyles(item, {
				color: line.color,
			})

			item.classList.toggle(styles.hidden, hidden)
			item.innerHTML = makeDescItemContent({
				value: line.value,
				name: line.name,
			})
		})

		const ys = lines
			.filter((line) => !hiddenLines[line.tag])
			.map((line) => 1 - line.point)
			.sort((a, b) => a > b ? 1 : -1)

		// TODO - maybe js animating will be smoother?
		setStyles(this.tooltip, {
			transform: `translate(${this.findTooltipXShift(rect)}px, ${this.findTooltipYShift(ys, rect)}px)`,
		})
	}

	hide() {
		setStyles(this.element, { display: 'none', left: `0%` })
		this.points.forEach((p) => p.remove())
		this.points = null
	}

	findTooltipYShift(y, rect) {
		if (y[0] > tooltipHeight + tooltipGap) {
			return 0
		}

		for (let i = 0; i < y.length; ++i) {
			const next = y[i+1] || 1
			const gap = next - y[i]

			if (gap >= tooltipHeight + 2 * tooltipGap) {
				return (y[i] + (gap - tooltipHeight) / 2) * rect.height
			}
		}

		return 0
	}

	findTooltipXShift(rect) {
		const { left, width } = getRect(this.tooltip)
		const right = this.element.offsetLeft + this.tooltip.offsetLeft + width

		if (right > rect.right) {
			return rect.right - right
		}

		if (left < rect.left) {
			return rect.left - left
		}

		return 0
	}
}