import { debounce, uuid } from './utils'

export const getRect = (el) => el.getBoundingClientRect()

const rectCache = { }

const updateRectsOnResize = debounce(() => {
	Object.keys(rectCache).forEach((key) => {
		rectCache[key].rect = rectCache[key].element.getBoundingClientRect()
	})
}, 200)

const resizeCheck = () => {
	window.addEventListener('resize', updateRectsOnResize)
}

resizeCheck()

export const createRectStorage = (element) => {
	const id = uuid()

	rectCache[id] = { element }

	return {
		get() {
			if (rectCache[id].rect) {
				return rectCache[id].rect
			}

			rectCache[id].rect = element.getBoundingClientRect()

			return rectCache[id].rect
		},
		remove() {
			delete rectCache[id]
		}
	}
}