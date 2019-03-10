const formatChartData = (data) => {
	const tags = Object.keys(data.types)
	const xTag = tags.find((t) => data.types[t] === 'x')
	const lineTags = tags.filter((t) => data.types[t] === 'line')
	const timestamps = data.columns.find((c) => c[0] === xTag).slice(1)
	const lines = data.columns
		.filter((c) => lineTags.includes(c[0]))
		.map((c) => {
			const tag = c[0]
			const cData = c.slice(1)

			return {
				tag,
				name: data.names[tag],
				points: cData.map((y, x) => ({ x, y })),
				max: Math.max(...cData),
				color: data.colors[tag],
			}
		})

	const width = timestamps.length
	const height = Math.max(...lines.map((line) => line.max))

	return { width, height, lines, timestamps }
}

const formatCharts = (json) => json.map(formatChartData)

const getData = async () => {
	try {
		const response = await fetch('./chart_data.json')

		if (response.ok) {
			return formatCharts(await response.json())
		}

		throw new Error('failed')
	} catch (e) {
		return Promise.resolve([])
	}
}

export default getData