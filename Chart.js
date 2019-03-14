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

class Preview {
	constructor(onChange) {
		this.element = document.createElement('input')
		this.element.type = 'range'
		this.element.min = '1'
		this.element.max = '10'
		this.element.step = '0.01'
		this.element.value = '1'

		this.element.addEventListener('input', onChange)
	}
}

class Preview2 {
	constructor(onChange) {
		this.element = document.createElement('input')
		this.element.type = 'range'
		this.element.min = '0'
		this.element.max = '1'
		this.element.step = '0.001'
		this.element.value = '0'

		this.element.addEventListener('input', onChange)
	}
}

export default class Chart {
	constructor(data) {
		this.element = document.createElement('div')
		this.element.classList.add('chart')

		this.lines = new Lines(data)
		this.element.appendChild(this.lines.element)

		this.preview = new Preview(this.updateScale.bind(this))
		this.element.appendChild(this.preview.element)

		this.preview2 = new Preview2(this.updatePosition.bind(this))
		this.element.appendChild(this.preview2.element)
	}

	updateScale(e) {
		const scale = +e.target.value

		this.lines.element.style.width = `${100 * scale}%`
	}

	updatePosition(e) {
		const position = +e.target.value

		this.lines.element.style.transform = `translateX(-${100 * position}%)`
	}
}