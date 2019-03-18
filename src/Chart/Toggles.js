import styles from './styles.css'
import {htmlElement} from "../utils"

const template = (lines) => `
	<div class="${styles.toggles}">
		${lines.map((line) => `
			<label class="${styles.toggle}" style="color: ${line.color}">
				<input type="checkbox" data-line="${line.tag}" checked>
				${line.name}
			</label>
		`).join('')}
	</div>
`

export default class Toggles {
	constructor(lines, onHiddenLinesUpdate, state) {
		this.state = state
		this.element = htmlElement(template(lines))

		this.element.addEventListener('change', this.handleChange.bind(this))
		this.hiddenLines = { }

		this.onHiddenLinesUpdate = onHiddenLinesUpdate
	}

	handleChange(e) {
		const tag = e.target.dataset.line
		const hidden = !e.target.checked

		this.onHiddenLinesUpdate({
			...this.state.hiddenLines,
			[tag]: hidden,
		})
	}

	onUpdate(state) {
		this.state = state
	}
}