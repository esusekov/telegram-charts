import Chart from './Chart'
import getData from './getData'
import styles from './charts.css'
import {htmlElement, select} from "./utils"

const template = `
	<div class=${styles.container}>
		<div class=${styles.charts}></div>
	</div>
`
const toggleTemplate = `<button class="${styles.themeToggle}"></button>`

class Charts {
	constructor(root, data) {
		this.dark = Boolean(localStorage.getItem('DARK'))
		this.element = htmlElement(template)
		this.element.classList.toggle('dark', this.dark)
		this.chartsElement = select(this.element, styles.charts)
		this.toggleElement = htmlElement(toggleTemplate)
		this.element.appendChild(this.toggleElement)
		this.handleToggle = this.handleToggle.bind(this)
		this.toggleElement.addEventListener('click', this.handleToggle)
		this.applyTheme()

		root.appendChild(this.element)

		data.forEach((chart) => this.chartsElement.appendChild(new Chart(chart).element))
	}

	handleToggle() {
		this.dark = !this.dark
		this.applyTheme()

		if (this.dark) {
			localStorage.setItem('DARK', '1')
		} else {
			localStorage.removeItem('DARK')
		}
	}

	applyTheme() {
		this.element.classList.toggle('dark', this.dark)
		this.toggleElement.innerHTML = `Switch to ${this.dark ? 'Day' : 'Night'} Mode`
	}
}

const init = async () => {
	const data = await getData()

	new Charts(document.getElementById('root'), data)
}

init()