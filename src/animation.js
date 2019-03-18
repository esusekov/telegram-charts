import { setAttributes } from './utils'

export const circ = (timeFraction) => {
	return 1 - Math.sin(Math.acos(timeFraction))
}

const makeEaseInOut = (timing) => {
	return (timeFraction) => {
		if (timeFraction < .5)
			return timing(2 * timeFraction) / 2
		else
			return (2 - timing(2 * (1 - timeFraction))) / 2
	}
}

const ease = makeEaseInOut(circ)

export const animate = ({ duration, timing = ease, draw }) => {
	let requestId
	const start = performance.now()

	requestId = requestAnimationFrame(function animation(time) {
		const timeFraction = Math.min((time - start) / duration, 1)

		draw(timing(timeFraction))

		if (timeFraction < 1) {
			requestId = requestAnimationFrame(animation)
		}
	})

	return () => {
		cancelAnimationFrame(requestId)
	}
}

export const viewBoxAnimator = (element, vBox) => {
	const viewBox = vBox
	const setViewBox = (newVBox) => {
		Object.assign(viewBox, newVBox)

		setAttributes(element, {
			viewBox: `${viewBox.xMin} ${viewBox.yMin} ${viewBox.xMax} ${viewBox.yMax}`,
		})
	}

	let target = { }
	let cancelAnimation

	setViewBox(vBox)

	return ({ xMin, xMax, yMin, yMax }) => {
		setViewBox({ xMin, xMax })

		if ((yMin === viewBox.yMin && yMax === viewBox.yMax) || (yMin === target.yMin && yMax === target.yMax)) {
			return
		}

		if (cancelAnimation) {
			cancelAnimation()
		}

		const initial = { yMin: viewBox.yMin, yMax: viewBox.yMax }
		target = { yMin, yMax }

		cancelAnimation = animate({
			draw: (progress) => {
				setViewBox({
					yMin: initial.yMin + (target.yMin - initial.yMin) * progress,
					yMax: initial.yMax + (target.yMax - initial.yMax) * progress,
				})
			},
			duration: 400,
		})
	}
}