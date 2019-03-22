export const htmlElement = (html) => {
	const template = document.createElement('template')

	html = html.trim()
	template.innerHTML = html

	return template.content.firstChild
}

export const setStyles = (el, styles) => Object.assign(el.style, styles)
export const setAttributes = (el, attrs) =>
	Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]))

export const getMaxItem = (arr, by = (item) => item) => {
	let max = arr[0]

	for (let i = 1; i < arr.length; ++i) {
		if (by(arr[i]) > by(max)) {
			max = arr[i]
		}
	}

	return max
}

export const select = (el, className) => el.querySelector(`.${className}`)

export const formatValue = (value) => {
	let suffix = ''
	let val = value

	if (value >= 1e6) {
		suffix = 'm'
		val /= 1e6
	} else if (value >= 1e3) {
		suffix = 'k'
		val /= 1e3
	}

	return `${Math.floor(val * 10) / 10}${suffix}`
}

export const debounce = (fn, ms) => {
	let timer = null

	return (...args) => {
		const onComplete = () => {
			fn(...args)
			timer = null
		}

		if (timer) {
			clearTimeout(timer)
		}

		timer = setTimeout(onComplete, ms)
	}
}

export const uuid = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0
		const v = c == 'x' ? r : (r & 0x3 | 0x8)

		return v.toString(16)
	})
}