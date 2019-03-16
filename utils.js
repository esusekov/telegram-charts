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