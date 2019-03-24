import styles from './styles.css'
import {htmlElement, select, uuid} from "../utils"

const template = `<div class="${styles.toggles}"></div>`

const makeLine = (id, line) => `
	<div class="${styles.toggle}">
		<input id="${id + line.tag}" class="${styles.toggleInput}" type="checkbox" checked>
		<label for="${id + line.tag}" class="${styles.toggleLabel}">
			<div class="${styles.checkBlock}" style="background-color: ${line.color}">
				<div class="${styles.checkBg}"></div>
				<svg class="${styles.check}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z "/>
				</svg>
			</div>
			${line.name}
		</label>
	</div>
`

export default class Toggles {
	constructor({ lines, onHiddenLinesUpdate, state }) {
		this.id = uuid()
		this.state = state
		this.lines = lines
		this.element = htmlElement(template)
		this.toggles = lines.map((line) => {
			const element = htmlElement(makeLine(this.id, line))

			return {
				element: element,
				input: select(element, styles.toggleInput),
				line,
			}
		})
		this.toggles.forEach((toggle) => {
			toggle.input.addEventListener('change', this.handleChange.bind(this, toggle.line))
			this.element.appendChild(toggle.element)
		})
		this.hiddenLines = { }

		this.onHiddenLinesUpdate = onHiddenLinesUpdate
	}

	handleChange(line, e) {
		const hidden = !e.target.checked

		this.onHiddenLinesUpdate({
			...this.state.hiddenLines,
			[line.tag]: hidden,
		})
	}

	onUpdate(state) {
		this.state = state
		this.updateDisabledToggle()
	}

	updateDisabledToggle() {
		const visibleLines = this.lines.filter((l) => !this.state.hiddenLines[l.tag])

		if (visibleLines.length === 1) {
			const tag = visibleLines[0].tag
			const { input } = this.toggles.find((toggle) => toggle.line.tag === tag)

			input.disabled = true
		} else {
			this.toggles.forEach((toggle) => {
				toggle.input.disabled = false
			})
		}
	}
}