import styles from './styles.css'
import {htmlElement, uuid} from "../utils"

const template = (id, lines) => `
	<div class="${styles.toggles}">
		${lines.map((line) => `
			<input id="${id + line.tag}" class="${styles.toggle}" type="checkbox" data-line="${line.tag}" checked>
			<label for="${id + line.tag}" class="${styles.toggleLabel}">
				<div class="${styles.checkBlock}"  style="background-color: ${line.color}">
					<div class="${styles.checkBg}"></div>
					<svg class="${styles.check}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z "/>
					</svg>
				</div>
				${line.name}
			</label>
		`).join('')}
	</div>
`

export default class Toggles {
	constructor({ lines, onHiddenLinesUpdate, state }) {
		this.id = uuid()
		this.state = state
		this.element = htmlElement(template(this.id, lines))

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