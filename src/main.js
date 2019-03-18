import Chart from './Chart'
import getData from './getData'
import styles from './charts.css'

class Charts {
	constructor(root, data) {
		this.element = document.createElement('div')
		this.element.classList.add(styles.charts)
		root.appendChild(this.element)

		this.element.appendChild(new Chart(data[0]).element)
		this.element.appendChild(new Chart(data[1]).element)
	}
}

const init = async () => {
	const data = await getData()

	new Charts(document.getElementById('root'), data)
}

init()