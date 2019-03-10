import Line from './Line'



class Lines {
	constructor(data) {
		const { width, height, lines, timestamps } = data
		this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		this.element.setAttribute('viewBox', `0 0 ${width} ${height}`)
		this.element.setAttribute('preserveAspectRatio', 'none')
		this.element.classList.add('lines')
		this.lines = lines.map((lineData) => new Line(lineData, { width, height }))

		this.lines.forEach((line) => {
			this.element.appendChild(line.element)
		})
	}
}

export default class Chart {
	constructor(data) {
		this.element = document.createElement('div')
		this.element.classList.add('chart')

		this.lines = new Lines(data)
		this.element.appendChild(this.lines.element)
	}
}