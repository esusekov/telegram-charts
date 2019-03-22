(function () {
	'use strict';

	const htmlElement = (html) => {
		const template = document.createElement('template');

		html = html.trim();
		template.innerHTML = html;

		return template.content.firstChild
	};

	const setStyles = (el, styles) => Object.assign(el.style, styles);
	const setAttributes = (el, attrs) =>
		Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));

	const getMaxItem = (arr, by = (item) => item) => {
		let max = arr[0];

		for (let i = 1; i < arr.length; ++i) {
			if (by(arr[i]) > by(max)) {
				max = arr[i];
			}
		}

		return max
	};

	const select = (el, className) => el.querySelector(`.${className}`);

	const formatValue = (value) => {
		let suffix = '';
		let val = value;

		if (value >= 1e6) {
			suffix = 'm';
			val /= 1e6;
		} else if (value >= 1e3) {
			suffix = 'k';
			val /= 1e3;
		}

		return `${Math.floor(val * 10) / 10}${suffix}`
	};

	const debounce = (fn, ms) => {
		let timer = null;

		return (...args) => {
			const onComplete = () => {
				fn(...args);
				timer = null;
			};

			if (timer) {
				clearTimeout(timer);
			}

			timer = setTimeout(onComplete, ms);
		}
	};

	const uuid = () => {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0;
			const v = c == 'x' ? r : (r & 0x3 | 0x8);

			return v.toString(16)
		})
	};

	function styleInject(css, ref) {
	  if ( ref === void 0 ) ref = {};
	  var insertAt = ref.insertAt;

	  if (!css || typeof document === 'undefined') { return; }

	  var head = document.head || document.getElementsByTagName('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (insertAt === 'top') {
	    if (head.firstChild) {
	      head.insertBefore(style, head.firstChild);
	    } else {
	      head.appendChild(style);
	    }
	  } else {
	    head.appendChild(style);
	  }

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }
	}

	var css = ".styles_line__x7yDJ {\n    opacity: 1;\n    transition: opacity 0.4s ease;\n}";
	var styles = {"line":"styles_line__x7yDJ"};
	styleInject(css);

	const generatePoints = (points) =>
		points.map(({ x, y }) => `${x},${-y}`).join(' ');

	class Polyline {
		constructor(lineData, attrs = { }) {
			this.element = null;
			this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			this.element.classList.add(styles.line);
			this.data = lineData;
			this.hidden = false;

			setAttributes(this.element, {
				'fill': 'none',
				'stroke': lineData.color,
				'stroke-width': '1rem',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'points': generatePoints(lineData.points),
				'vector-effect': 'non-scaling-stroke',
				...attrs,
			});
		}

		updateVisibility(hidden) {
			if (this.hidden !== hidden) {
				this.hidden = hidden;

				setStyles(this.element, {
					'opacity': hidden ? '0' : '1',
				});
			}
		}
	}

	var css$1 = ".styles_picker__1g53n {\n    position: relative;\n    width: 100%;\n    height: 7vh;\n    contain: layout style paint;\n}\n\n.styles_chart__1L2G1 {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n}\n\n.styles_chartLines__1gmyb {\n    width: 100%;\n    height: 100%;\n}\n\n.styles_overlayLeft__1nT7n,\n.styles_overlayRight__SDIqK {\n    position: absolute;\n    z-index: 1;\n    top: 0;\n    width: 100%;\n    height: 100%;\n    background-color: #f5f9fb;\n    opacity: 0.9;\n}\n\n.styles_overlayLeft__1nT7n {\n    left: 0;\n}\n\n.styles_overlayRight__SDIqK {\n    right: 0;\n}\n\n.styles_slider__1FAKF {\n    position: absolute;\n    z-index: 2;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    box-sizing: border-box;\n    border-color: #ddeaf3;\n    border-style: solid;\n    border-width: 0.5rem 3rem;\n    opacity: 0.8;\n}\n\n.styles_sliderLeftControl__Vldnw,\n.styles_sliderRightControl__2dvEO {\n    position: absolute;\n    z-index: 3;\n    top: 0;\n    width: 8rem;\n    height: 100%;\n}\n\n.styles_sliderLeftControl__Vldnw {\n    left: -5.5rem;\n}\n\n.styles_sliderRightControl__2dvEO {\n    right: -5.5rem;\n}\n\n/* dark mode styles */\n.dark .styles_overlayLeft__1nT7n,\n.dark .styles_overlayRight__SDIqK {\n    background-color: #1f2a38;\n}\n\n.dark .styles_slider__1FAKF {\n    opacity: 0.2;\n}";
	var styles$1 = {"picker":"styles_picker__1g53n","chart":"styles_chart__1L2G1","chartLines":"styles_chartLines__1gmyb","overlayLeft":"styles_overlayLeft__1nT7n","overlayRight":"styles_overlayRight__SDIqK","slider":"styles_slider__1FAKF","sliderLeftControl":"styles_sliderLeftControl__Vldnw","sliderRightControl":"styles_sliderRightControl__2dvEO"};
	styleInject(css$1);

	const circ = (timeFraction) => {
		return 1 - Math.sin(Math.acos(timeFraction))
	};

	const makeEaseInOut = (timing) => {
		return (timeFraction) => {
			if (timeFraction < .5)
				return timing(2 * timeFraction) / 2
			else
				return (2 - timing(2 * (1 - timeFraction))) / 2
		}
	};

	const ease = makeEaseInOut(circ);

	const animate = ({ duration, timing = ease, draw }) => {
		let requestId;
		const start = performance.now();

		requestId = requestAnimationFrame(function animation(time) {
			const timeFraction = Math.min((time - start) / duration, 1);

			draw(timing(timeFraction));

			if (timeFraction < 1) {
				requestId = requestAnimationFrame(animation);
			}
		});

		return () => {
			cancelAnimationFrame(requestId);
		}
	};

	const viewBoxAnimator = (element, vBox) => {
		const viewBox = vBox;
		const setViewBox = (newVBox) => {
			Object.assign(viewBox, newVBox);

			setAttributes(element, {
				viewBox: `${viewBox.xMin} ${viewBox.yMin} ${viewBox.xMax} ${viewBox.yMax}`,
			});
		};

		let target = { };
		let cancelAnimation;

		setViewBox(vBox);

		return ({ xMin, xMax, yMin, yMax }) => {
			setViewBox({ xMin, xMax });

			if ((yMin === viewBox.yMin && yMax === viewBox.yMax) || (yMin === target.yMin && yMax === target.yMax)) {
				return
			}

			if (cancelAnimation) {
				cancelAnimation();
			}

			const initial = { yMin: viewBox.yMin, yMax: viewBox.yMax };
			target = { yMin, yMax };

			cancelAnimation = animate({
				draw: (progress) => {
					setViewBox({
						yMin: initial.yMin + (target.yMin - initial.yMin) * progress,
						yMax: initial.yMax + (target.yMax - initial.yMax) * progress,
					});
				},
				duration: 400,
			});
		}
	};

	const getRect = (el) => el.getBoundingClientRect();

	const rectCache = { };

	const updateRectsOnResize = debounce(() => {
		Object.keys(rectCache).forEach((key) => {
			rectCache[key].rect = rectCache[key].element.getBoundingClientRect();
		});
	}, 200);

	const resizeCheck = () => {
		window.addEventListener('resize', updateRectsOnResize);
	};

	resizeCheck();

	const createRectStorage = (element) => {
		const id = uuid();

		rectCache[id] = { element };

		return {
			get() {
				if (rectCache[id].rect) {
					return rectCache[id].rect
				}

				rectCache[id].rect = element.getBoundingClientRect();

				return rectCache[id].rect
			},
			remove() {
				delete rectCache[id];
			}
		}
	};

	const template = `
	<div class="${styles$1.picker}">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="${styles$1.chart}"
			preserveAspectRatio="none"
		></svg>
		<div class="${styles$1.overlayLeft}"></div>
		<div class="${styles$1.slider}">
			<div class="${styles$1.sliderLeftControl}"></div>
			<div class="${styles$1.sliderRightControl}"></div>
		</div>
		<div class="${styles$1.overlayRight}"></div>
	</div>
`;

	class RangePicker {
		constructor(data, onRangeUpdate, state) {
			const { width, height, lines } = data;

			this.data = data;
			this.state = state;
			this.element = htmlElement(template);
			this.rect = createRectStorage(this.element);
			this.onRangeUpdate = onRangeUpdate;
			this.chartElement = select(this.element, styles$1.chart);

			this.lines = lines
				.map((lineData) => new Polyline(lineData, { 'stroke-width': '0.5rem' }));

			this.lines.forEach((line) => this.chartElement.appendChild(line.element));

			this.slider = select(this.element, styles$1.slider);
			this.sliderLeftControl = select(this.element, styles$1.sliderLeftControl);
			this.sliderRightControl = select(this.element, styles$1.sliderRightControl);
			this.overlayLeft = select(this.element, styles$1.overlayLeft);
			this.overlayRight = select(this.element, styles$1.overlayRight);

			this.onUpdate(this.state);
			this.bindHandlers();
			this.addListeners();
		}

		onUpdate(state) {
			this.state = state;

			const { x1, x2, hiddenLines } = state;
			const max = Math.max(...this.data.lines.filter((line) => !hiddenLines[line.tag]).map((l) => l.max));

			setStyles(this.slider, { left: `${x1 * 100}%`, width: `${(x2 - x1) * 100}%` });
			setStyles(this.overlayLeft, { width: `${x1 * 100}%` });
			setStyles(this.overlayRight, { width: `${100 - (x2 * 100)}%` });

			const viewBox = {
				xMin: 0,
				xMax: this.data.width,
				yMin: -max,
				yMax: max,
			};

			if (!this.animator) {
				this.animator = viewBoxAnimator(this.chartElement, viewBox);
			} else {
				this.animator(viewBox);
			}

			this.lines.forEach((line) => line.updateVisibility(hiddenLines[line.data.tag]));
		}

		updateRange(x1 = this.state.x1, x2 = this.state.x2) {
			if (x1 === this.state.x1 && x2 === this.state.x2) {
				return
			}

			this.onRangeUpdate(x1, x2);
		}

		getEventX(e) {
			const { left, width } = this.rect.get();

			return (e.touches[0].clientX - left) / width
		}

		handleDragLeft(e) {
			if (e.target === this.sliderLeftControl) {
				const touchX = this.getEventX(e);
				const x1 = Math.min(Math.max(0, touchX), this.state.x2 - 0.1);

				this.updateRange(x1);
			}
		}

		handleDragRight(e) {
			if (e.target === this.sliderRightControl) {
				const touchX = this.getEventX(e);
				const x2 = Math.max(Math.min(1, touchX), this.state.x1 + 0.1);

				this.updateRange(undefined, x2);
			}
		}

		handleDrag(e) {
			if (e.target === this.slider) {
				const touchX = this.getEventX(e);

				if (typeof this.prevX === 'number') {
					const dx = touchX - this.prevX;
					const x1 = this.state.x1 + dx;
					const x2 = this.state.x2 + dx;

					if (x1 > 0 && x2 < 1) {
						this.updateRange(x1, x2);
					}
				}

				this.prevX = touchX;
			}
		}

		handleDragEnd() {
			this.prevX = null;
		}

		bindHandlers() {
			this.handleDragLeft = this.handleDragLeft.bind(this);
			this.handleDragRight = this.handleDragRight.bind(this);
			this.handleDrag = this.handleDrag.bind(this);
			this.handleDragEnd = this.handleDragEnd.bind(this);
			this.updateRange = this.updateRange.bind(this);
		}

		addListeners() {
			// TODO - implement mouse events
			this.sliderLeftControl.addEventListener('touchmove', this.handleDragLeft);
			this.sliderRightControl.addEventListener('touchmove', this.handleDragRight);
			this.slider.addEventListener('touchmove', this.handleDrag);
			this.slider.addEventListener('touchend', this.handleDragEnd);
		}
	}

	var css$2 = ".styles_grid__1z4Y9 {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    left: 0;\n    top: 0;\n    font-size: 3.5rem;\n}\n\n.styles_yAxis__7b-0Q {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n    pointer-events: none;\n}\n\n.styles_xAxis__3dPr_ {\n    position: absolute;\n    left: 0;\n    top: 100%;\n    width: 100%;\n    height: 12rem;\n    pointer-events: none;\n}\n\n.styles_yAxisItems__2JZ7W {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n}\n\n.styles_yAxisItem__T1WfW {\n    position: absolute;\n    left: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100%;\n\n    display: flex;\n    align-items: flex-end;\n\n    color: #a2adb4;\n    font-size: 8rem;\n    line-height: 12rem;\n\n    border-bottom: 1px solid rgba(162, 173, 180, 0.5);\n}\n\n.styles_xAxisItem__2Wti7 {\n    position: absolute;\n    width: 2rem;\n    height: 12rem;\n    margin-left: -1rem;\n    bottom: 0;\n    left: 0;\n    text-align: center;\n    background-color: transparent;\n    color: #a2adb4;\n    font-size: 8rem;\n    line-height: 12rem;\n    white-space: nowrap;\n\n    display: none;\n    opacity: 1;\n    align-items: flex-end;\n    justify-content: center;\n}";
	var styles$2 = {"grid":"styles_grid__1z4Y9","yAxis":"styles_yAxis__7b-0Q","xAxis":"styles_xAxis__3dPr_","yAxisItems":"styles_yAxisItems__2JZ7W","yAxisItem":"styles_yAxisItem__T1WfW","xAxisItem":"styles_xAxisItem__2Wti7"};
	styleInject(css$2);

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const dateString = (date) => `${months[date.getMonth()]}\u00a0${date.getDate()}`;

	const getDate = (ts) => dateString(new Date(ts));

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const getWeekDate = (ts) => {
		const date = new Date(ts);

		return `${days[date.getDay()]},\u00a0${dateString(date)}`
	};

	var css$3 = ".styles_container__3qbb9 {\n    position: absolute;\n    top: 0;\n    left: 0;\n    display: none;\n    width: 0.5rem;\n    height: 100%;\n    background-color: rgba(162, 173, 180, 0.6);\n}\n\n.styles_tooltip__1F_qS {\n    position: absolute;\n    top: 0;\n    left: -12rem;\n    z-index: 1;\n\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    width: auto;\n    height: 25%;\n    padding: 4rem 8rem;\n    box-sizing: border-box;\n    background-color: white;\n    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);\n    border-radius: 3rem;\n    transition: transform 0.2s ease;\n}\n\n.styles_point__3IY6W {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 6rem;\n    height: 6rem;\n    border: 1rem solid black;\n    border-radius: 50%;\n    box-sizing: border-box;\n    background-color: white;\n    transform: translate(-50%, 50%);\n}\n\n.styles_date__19e-x {\n    color: #333;\n    font-size: 10rem;\n}\n\n.styles_desc__26TU0 {\n    display: flex;\n    justify-content: space-between;\n}\n\n.styles_descItem__3sD6R {\n    display: flex;\n    flex-direction: column;\n    margin-right: 8rem;\n}\n\n.styles_descItem__3sD6R.styles_hidden__30Nr- {\n    display: none;\n    margin-right: 0;\n}\n\n.styles_descItem__3sD6R:not(.styles_hidden__30Nr-):last-child {\n    margin-right: 0;\n}\n\n.styles_value__2JuQs {\n    font-size: 12rem;\n}\n\n.styles_tag__iugF6 {\n    font-size: 6rem;\n}\n\n/* dark mode styles */\n.dark .styles_tooltip__1F_qS {\n    background-color: #242f3e;\n    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.3);\n}\n\n.dark .styles_date__19e-x {\n    color: white;\n}\n\n.dark .styles_point__3IY6W {\n    background-color: #242f3e;\n}";
	var styles$3 = {"container":"styles_container__3qbb9","tooltip":"styles_tooltip__1F_qS","point":"styles_point__3IY6W","date":"styles_date__19e-x","desc":"styles_desc__26TU0","descItem":"styles_descItem__3sD6R","hidden":"styles_hidden__30Nr-","value":"styles_value__2JuQs","tag":"styles_tag__iugF6"};
	styleInject(css$3);

	const template$1 = `
	<div class="${styles$3.container}">
		<div class="${styles$3.tooltip}">
			<div class="${styles$3.date}"></div>
			<div class="${styles$3.desc}"></div>
		</div>
	</div>
`;

	const pointTemplate = `<div class="${styles$3.point}"></div>`;
	const descItemTemplate = `<div class="${styles$3.descItem}"></div>`;

	const makeDescItemContent = ({ value, name }) => `
	<div class="${styles$3.value}">${formatValue(value)}</div>
	<div class="${styles$3.tag}">${name}</div>
`;

	const tooltipHeight = 0.25;
	const tooltipGap = 0.02;

	class Tooltip {
		constructor() {
			this.element = htmlElement(template$1);
			this.tooltip = select(this.element, styles$3.tooltip);
			this.date = select(this.element, styles$3.date);
			this.desc = select(this.element, styles$3.desc);
		}

		show({ x, lines, timestamp, hiddenLines, rect }) {
			setStyles(this.element, { display: 'block', left: `${100 * x}%` });

			if (!this.points) {
				this.points = lines.map(() => htmlElement(pointTemplate));
				this.points.forEach((p) => this.element.appendChild(p));
			}

			this.date.textContent = getWeekDate(timestamp);

			if (!this.items) {
				this.items = lines.map(() => htmlElement(descItemTemplate));
				this.items.forEach((i) => this.desc.appendChild(i));
			}

			lines.forEach((line, index) => {
				const point = this.points[index];
				const item = this.items[index];
				const hidden = Boolean(hiddenLines[line.tag]);

				setStyles(point, {
					display: hidden ? 'none' : 'block',
					borderColor: line.color,
					bottom: `${100 * line.point}%`
				});
				setStyles(item, {
					color: line.color,
				});

				item.classList.toggle(styles$3.hidden, hidden);
				item.innerHTML = makeDescItemContent({
					value: line.value,
					name: line.name,
				});
			});

			const ys = lines
				.filter((line) => !hiddenLines[line.tag])
				.map((line) => 1 - line.point)
				.sort((a, b) => a > b ? 1 : -1);

			// TODO - maybe js animating will be smoother?
			setStyles(this.tooltip, {
				transform: `translate(${this.findTooltipXShift(rect)}px, ${this.findTooltipYShift(ys, rect)}px)`,
			});
		}

		hide() {
			setStyles(this.element, { display: 'none', left: `0%` });
			this.points.forEach((p) => p.remove());
			this.points = null;
		}

		findTooltipYShift(y, rect) {
			if (y[0] > tooltipHeight + tooltipGap) {
				return 0
			}

			for (let i = 0; i < y.length; ++i) {
				const next = y[i+1] || 1;
				const gap = next - y[i];

				if (gap >= tooltipHeight + 2 * tooltipGap) {
					return (y[i] + (gap - tooltipHeight) / 2) * rect.height
				}
			}

			return 0
		}

		findTooltipXShift(rect) {
			const { left, width } = getRect(this.tooltip);
			const right = this.element.offsetLeft + this.tooltip.offsetLeft + width;

			if (right > rect.right) {
				return rect.right - right
			}

			if (left < rect.left) {
				return rect.left - left
			}

			return 0
		}
	}

	const template$2 = `
	<div class="${styles$2.grid}">
		<div class="${styles$2.yAxis}"></div>
		<div class="${styles$2.xAxis}"></div>
	</div>
`;

	const makeYAxis = (data) => `
	<div class="${styles$2.yAxisItems}">
		${data.map((value, index) => `
			<div class="${styles$2.yAxisItem}" style="transform: translateY(-${index * (100 / data.length)}%)">${value}</div>
		`).join('')}
	</div>
`;

	const makeXItem = (timestamp, x) => `
	<div 
		class="${styles$2.xAxisItem}" 
		style="left: ${x * 100}%"
	>
		${getDate(timestamp)}
	</div>
`;

	const digitsCount = (num) => {
		return (Math.log10((num ^ (num >> 31)) - (num >> 31)) | 0) + 1;
	};

	const getYItems = (max) => {
		const digits = digitsCount(max);
		const divider = Math.pow(10, Math.max(0, digits - 2));
		let targetMax = Math.floor(max / divider) * divider;
		const step = Math.floor(targetMax / 5);

		return [0, step, 2 * step, 3 * step, 4 * step, 5 * step]
	};

	function nearestPow2(num) {
		return Math.pow(2, Math.round(Math.log(num) / Math.log(2)))
	}

	const getStep = (tsCount, x1, x2) => {
		const initialStep = Math.floor(0.1 * tsCount / 5);
		const calculatedStep = Math.floor((x2 - x1) * tsCount / 5);
		const scale = nearestPow2(calculatedStep / initialStep) || 1;

		return scale * initialStep
	};

	class Grid {
		constructor(data, { x1, x2, max, hiddenLines }) {
			this.element = htmlElement(template$2);
			this.yAxis = select(this.element, styles$2.yAxis);
			this.xAxis = select(this.element, styles$2.xAxis);
			this.max = max;
			this.x1 = x1;
			this.x2 = x2;
			this.hiddenLines = hiddenLines;
			this.data = data;
			this.renderY(max);
			this.initX();
			this.renderX(x1, x2);

			this.tooltip = new Tooltip();
			this.element.appendChild(this.tooltip.element);

			this.rect = createRectStorage(this.element);

			this.handlePointerOver = this.handlePointerOver.bind(this);
			this.handlePointerOut = this.handlePointerOut.bind(this);
			this.element.addEventListener('mousemove', this.handlePointerOver);
			this.element.addEventListener('mouseleave', this.handlePointerOut);
			this.element.addEventListener('touchstart', this.handlePointerOver);
			this.element.addEventListener('touchmove', this.handlePointerOver);
			this.element.addEventListener('touchend', this.handlePointerOut);
		}

		onUpdate({ x1, x2, max, hiddenLines }) {
			this.hiddenLines = hiddenLines;

			if (max !== this.max) {
				this.max = max;
				this.renderY(max);
			}

			if (x1 !== this.x1 || x2 !== this.x2) {
				this.x1 = x1;
				this.x2 = x2;
				this.renderX(x1, x2);
			}
		}

		handlePointerOver(e) {
			const rect = this.rect.get();
			const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
			const relativeX = Math.min(Math.max(x / rect.width, 0), 1);
			const index = Math.round(((this.x2 - this.x1) * relativeX + this.x1) * this.data.width);
			const coord = (index  / this.data.width - this.x1) / (this.x2 - this.x1);

			this.tooltip.show({
				x: coord,
				hiddenLines: this.hiddenLines,
				timestamp: this.data.timestamps[index],
				lines: this.data.lines.map(({ points, ...l }) => ({
					...l,
					point: points[index].y / this.max,
					value: points[index].y,
				})),
				rect,
			});
		}

		handlePointerOut() {
			this.tooltip.hide();
		}

		initX() {
			const { timestamps } = this.data;

			this.timestamps = timestamps.map((ts, index) => htmlElement(makeXItem(ts, index / timestamps.length)));
			this.timestamps.forEach((node) => this.xAxis.appendChild(node));
		}

		renderX(x1, x2) {
			const { timestamps } = this.data;
			const width = 100 / (x2 - x1);
			const first = Math.max(Math.ceil(x1 * timestamps.length), 0);
			const last = Math.min(Math.floor(x2 * timestamps.length), timestamps.length - 1);
			const step = getStep(timestamps.length, x1, x2);

			this.timestamps.forEach((node, index) => {
				const visible = (index >= first && index <= last);
				node.style.display = visible ? 'flex' : 'none';

				// TODO - there was opacity transition here, but it makes the whole app slow, figure out what to do with it
				if (visible && (timestamps.length - index) % step === 0) {
					node.style.opacity = '1';
				} else {
					node.style.opacity = '0';
				}
			});

			setStyles(this.xAxis, {
				width: `${width}%`,
				transform: `translateX(${-x1 * 100}%)`
			});
		}

		renderY(max) {
			if (this.yAxisItems) {
				this.yAxisItems.remove();
			}

			const data = getYItems(max);
			this.yAxisItems = htmlElement(makeYAxis(data));
			this.yAxis.appendChild(this.yAxisItems);
		}
	}

	var css$4 = ".styles_container__3Tw62 {\n    width: 100%;\n    padding: 8rem;\n    height: auto;\n    box-sizing: border-box;\n    overflow: hidden;\n}\n\n@media (min-aspect-ratio: 1/1) {\n    .styles_container__3Tw62 {\n        padding: 0 20%;\n    }\n}\n\n.styles_title__2C1xN {\n    font-size: 12rem;\n    font-weight: 600;\n    margin-bottom: 14rem;\n}\n\n.styles_chart__1MvQy {\n    position: relative;\n    width: 100%;\n    height: 40vh;\n    margin-bottom: 5vh;\n}\n\n.styles_lines__XIx1X {\n    position: absolute;\n    top: 0;\n    left: -10%;\n    width: 120%;\n    height: 100%;\n}\n\n.styles_toggles__1iKKZ {\n    display: flex;\n    margin-top: 12rem;\n}\n\n.styles_toggleLabel__6S6Jy {\n    display: flex;\n    height: 22rem;\n    padding: 5rem 7rem 5rem 5rem;\n    border: 1px solid #a2adb4;\n    border-radius: 12rem;\n    box-sizing: border-box;\n    margin-right: 10rem;\n    font-size: 10rem;\n    font-weight: lighter;\n    line-height: 12rem;\n    color: #333;\n}\n\n.styles_checkBlock__2wBM9 {\n    position: relative;\n    width: 12rem;\n    height: 12rem;\n    padding: 1rem;\n    margin-right: 6rem;\n    border-radius: 6rem;\n    box-sizing: border-box;\n}\n\n.styles_checkBg__3-TkC {\n    width: 10rem;\n    height: 10rem;\n    border-radius: 5rem;\n    background-color: white;\n    transition: transform 0.2s ease;\n}\n\n.styles_check__15gOg {\n    position: absolute;\n    top: calc(50% - 4rem);\n    left: calc(50% - 4rem);\n    width: 8rem;\n    height: 8rem;\n    fill: white;\n    stroke-width: 0.5rem;\n    stroke: white;\n    transform: scale(0);\n    transition: transform 0.2s ease;\n}\n\n.styles_toggle__1yMSt {\n    visibility: hidden;\n    width: 0;\n    height: 0;\n    margin: 0;\n}\n\n.styles_toggle__1yMSt:checked + .styles_toggleLabel__6S6Jy .styles_checkBg__3-TkC {\n    transform: scale(0);\n}\n\n.styles_toggle__1yMSt:checked + .styles_toggleLabel__6S6Jy .styles_check__15gOg {\n    transform: scale(1);\n}\n\n/* dark mode styles */\n.dark .styles_title__2C1xN {\n    color: white;\n}\n\n.dark .styles_toggleLabel__6S6Jy {\n    color: white;\n}\n\n.dark .styles_checkBg__3-TkC {\n    background-color: #242f3e;\n}";
	var styles$4 = {"container":"styles_container__3Tw62","title":"styles_title__2C1xN","chart":"styles_chart__1MvQy","lines":"styles_lines__XIx1X","toggles":"styles_toggles__1iKKZ","toggleLabel":"styles_toggleLabel__6S6Jy","checkBlock":"styles_checkBlock__2wBM9","checkBg":"styles_checkBg__3-TkC","check":"styles_check__15gOg","toggle":"styles_toggle__1yMSt"};
	styleInject(css$4);

	const template$3 = (id, lines) => `
	<div class="${styles$4.toggles}">
		${lines.map((line) => `
			<input id="${id + line.tag}" class="${styles$4.toggle}" type="checkbox" data-line="${line.tag}" checked>
			<label for="${id + line.tag}" class="${styles$4.toggleLabel}">
				<div class="${styles$4.checkBlock}"  style="background-color: ${line.color}">
					<div class="${styles$4.checkBg}"></div>
					<svg class="${styles$4.check}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z "/>
					</svg>
				</div>
				${line.name}
			</label>
		`).join('')}
	</div>
`;

	class Toggles {
		constructor({ lines, onHiddenLinesUpdate, state }) {
			this.id = uuid();
			this.state = state;
			this.element = htmlElement(template$3(this.id, lines));

			this.element.addEventListener('change', this.handleChange.bind(this));
			this.hiddenLines = { };

			this.onHiddenLinesUpdate = onHiddenLinesUpdate;
		}

		handleChange(e) {
			const tag = e.target.dataset.line;
			const hidden = !e.target.checked;

			this.onHiddenLinesUpdate({
				...this.state.hiddenLines,
				[tag]: hidden,
			});
		}

		onUpdate(state) {
			this.state = state;
		}
	}

	const getMax = (data, { x1, x2, hiddenLines }) => getMaxItem(
		data.lines.filter((line) => !hiddenLines[line.tag]).reduce((points, l) =>
			points.concat(l.points.filter((p) => {
				const relX = p.x / l.points.length;

				return relX >= x1 && relX <= x2
			})),
		[]),
		(p) => p.y
	);

	const makeTemplate = (title) => `
	<div class="${styles$4.container}">
		<h2 class="${styles$4.title}">${title}</h2>
		<div class="${styles$4.chart}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="${styles$4.lines}"
				preserveAspectRatio="none"
			></svg>
		</div>
	</div>
`;

	class Chart {
		constructor(data) {
			const { lines, title } = data;

			this.state = {
				x1: 0.9,
				x2: 1,
				hiddenLines: { },
			};

			this.state.max = getMax(data, this.state).y;

			this.data = data;
			this.element = htmlElement(makeTemplate(title));

			this.chartElement = select(this.element, styles$4.chart);
			this.linesElement = select(this.element, styles$4.lines);

			this.lines = lines.map((lineData) => new Polyline(lineData));
			this.lines.forEach((line) => this.linesElement.appendChild(line.element));

			this.grid = new Grid(data, this.state);
			this.chartElement.appendChild(this.grid.element);

			this.onRangeUpdate = this.onRangeUpdate.bind(this);
			this.slider = new RangePicker(data, this.onRangeUpdate, this.state);
			this.element.appendChild(this.slider.element);

			this.onHiddenLinesUpdate = this.onHiddenLinesUpdate.bind(this);
			this.toggles = new Toggles({
				lines,
				onHiddenLinesUpdate: this.onHiddenLinesUpdate,
				state: this.state,
			});
			this.element.appendChild(this.toggles.element);

			this.onUpdate();
		}

		onHiddenLinesUpdate(hiddenLines) {
			this.updateState({ hiddenLines });
		}

		onRangeUpdate(x1, x2) {
			this.updateState({ x1, x2 });
		}

		updateState(obj) {
			this.state = Object.assign({}, this.state, obj);
			this.state.max = getMax(this.data, this.state).y;

			this.grid.onUpdate(this.state);
			this.slider.onUpdate(this.state);
			this.toggles.onUpdate(this.state);
			this.onUpdate();
		}

		onUpdate() {
			const { x1, x2, max, hiddenLines } = this.state;
			const margin = (x2 - x1) * 0.1;
			const viewBox = {
				xMin: (x1 - margin) * this.data.width,
				xMax: (x2 - x1 + 2 * margin) * this.data.width,
				yMin: -max,
				yMax: max,
			};

			if (!this.animator) {
				this.animator = viewBoxAnimator(this.linesElement, viewBox);
			} else {
				this.animator(viewBox);
			}

			this.lines.forEach((line) => {
				line.updateVisibility(hiddenLines[line.data.tag]);
			});
		}

	}

	const formatChartData = (data, index) => {
		const tags = Object.keys(data.types);
		const xTag = tags.find((t) => data.types[t] === 'x');
		const lineTags = tags.filter((t) => data.types[t] === 'line');
		const timestamps = data.columns.find((c) => c[0] === xTag).slice(1);
		const lines = data.columns
			.filter((c) => lineTags.includes(c[0]))
			.map((c) => {
				const tag = c[0];
				const cData = c.slice(1);

				return {
					tag,
					name: data.names[tag],
					points: cData.map((y, x) => ({ x, y })),
					max: getMaxItem(cData),
					color: data.colors[tag],
				}
			});

		const width = timestamps.length - 1;
		const height = getMaxItem(lines, (line) => line.max).max;

		return { width, height, lines, timestamps, title: `Chart #${index + 1}` }
	};

	const formatCharts = (json) => json.map(formatChartData);

	const getData = async () => {
		try {
			const response = await fetch('./chart_data.json');

			if (response.ok) {
				return formatCharts(await response.json())
			}

			throw new Error('failed')
		} catch (e) {
			return Promise.resolve([])
		}
	};

	var css$5 = "html,\nbody,\n#root,\n.charts_container__An6op {\n    width: 100%;\n    height: 100%;\n    padding: 0;\n    margin: 0;\n    position: fixed;\n    overflow: hidden;\n    font-size: 4px;\n    font-family: sans-serif;\n}\n\n* {\n    user-select: none;\n}\n\n.charts_container__An6op {\n    background-color: white;\n    -webkit-overflow-scrolling: touch;\n    /*transition: background-color 0.2s ease;*/\n}\n\n.charts_container__An6op.dark {\n    background-color: #242f3e;\n}\n\n.charts_charts__2gh4S {\n    width: 100%;\n    height: 100%;\n    padding-bottom: 12vh;\n    box-sizing: border-box;\n    overflow-y: auto;\n}\n\n.charts_themeToggle__2ES9w {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 10vh;\n    background-color: white;\n    font-size: 12rem;\n    color: #188ee3;\n    border: 0;\n    outline: none;\n    padding: 0;\n    box-shadow: 0 -10rem 10rem white;\n    /*transition-property: background-color, box-shadow;*/\n    /*transition-duration: 0.15s;*/\n    /*transition-timing-function: ease;*/\n}\n\n.dark .charts_themeToggle__2ES9w {\n    background-color: #242f3e;\n    box-shadow: 0 -10rem 10rem #242f3e;\n}\n\n@media (min-aspect-ratio: 1/1) {\n    html {\n        font-size: 2px;\n    }\n}\n\n@media (max-width: 960px) {\n    html {\n        font-size: 2px;\n    }\n}";
	var styles$5 = {"container":"charts_container__An6op","charts":"charts_charts__2gh4S","themeToggle":"charts_themeToggle__2ES9w"};
	styleInject(css$5);

	const template$4 = `
	<div class=${styles$5.container}>
		<div class=${styles$5.charts}></div>
	</div>
`;
	const toggleTemplate = `<button class="${styles$5.themeToggle}"></button>`;

	class Charts {
		constructor(root, data) {
			this.dark = Boolean(localStorage.getItem('DARK'));
			this.element = htmlElement(template$4);
			this.element.classList.toggle('dark', this.dark);
			this.chartsElement = select(this.element, styles$5.charts);
			this.toggleElement = htmlElement(toggleTemplate);
			this.element.appendChild(this.toggleElement);
			this.handleToggle = this.handleToggle.bind(this);
			this.toggleElement.addEventListener('click', this.handleToggle);
			this.applyTheme();

			root.appendChild(this.element);

			data.forEach((chart) => this.chartsElement.appendChild(new Chart(chart).element));
		}

		handleToggle() {
			this.dark = !this.dark;
			this.applyTheme();

			if (this.dark) {
				localStorage.setItem('DARK', '1');
			} else {
				localStorage.removeItem('DARK');
			}
		}

		applyTheme() {
			this.element.classList.toggle('dark', this.dark);
			this.toggleElement.innerHTML = `Switch to ${this.dark ? 'Day' : 'Night'} Mode`;
		}
	}

	const init = async () => {
		const data = await getData();

		new Charts(document.getElementById('root'), data);
	};

	init();

}());
