import Chart from "./Chart"
import getData from "./getData"

class Charts {
	constructor(root, data) {
		this.element = document.createElement('div')
		this.element.classList.add('charts')
		root.appendChild(this.element)

		const chart = new Chart(data[data.length - 2])

		this.element.appendChild(chart.element)
	}
}

const init = async () => {
	const data = await getData()

	new Charts(document.getElementById('root'), data)
}

init()