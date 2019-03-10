const generatePoints = (points, { height }) =>
	points.map(({ x, y }) => `${x},${height - y}`).join(' ')

export default class Line {
	constructor(lineData, viewBox) {
		this.element = null
		this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
		this.element.setAttribute('fill', 'none')
		this.element.setAttribute('stroke', lineData.color)
		this.element.setAttribute('stroke-width', '2px')
		this.element.setAttribute('points', generatePoints(lineData.points, viewBox))
		this.element.setAttribute('vector-effect', 'non-scaling-stroke')
	}
}