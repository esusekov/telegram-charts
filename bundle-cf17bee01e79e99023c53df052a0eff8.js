(function () {
	'use strict';

	const DEFAULT_RANGE = 0.15;

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

	const isTouchDevice = () => 'ontouchstart' in window;

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

			setAttributes(this.element, Object.assign({
				'fill': 'none',
				'stroke': lineData.color,
				'stroke-width': '1rem',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'points': generatePoints(lineData.points),
				'vector-effect': 'non-scaling-stroke',
			}, attrs));
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

	var css$1 = ".styles_picker__1g53n {\n    position: relative;\n    width: 100%;\n    height: 7vh;\n    contain: layout style paint;\n}\n\n.styles_chart__1L2G1 {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n}\n\n.styles_chartLines__1gmyb {\n    width: 100%;\n    height: 100%;\n}\n\n.styles_overlayLeft__1nT7n,\n.styles_overlayRight__SDIqK {\n    position: absolute;\n    z-index: 1;\n    top: -1px;\n    width: 100%;\n    height: calc(100% + 2px);\n    background-color: #f5f9fb;\n    opacity: 0.9;\n}\n\n.styles_overlayLeft__1nT7n {\n    left: -1px;\n}\n\n.styles_overlayRight__SDIqK {\n    right: -1px;\n}\n\n.styles_slider__1FAKF {\n    position: absolute;\n    z-index: 2;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    box-sizing: border-box;\n    border-color: #ddeaf3;\n    border-style: solid;\n    border-width: 0.5rem 3rem;\n    opacity: 0.8;\n}\n\n.styles_sliderLeftControl__Vldnw,\n.styles_sliderRightControl__2dvEO {\n    position: absolute;\n    z-index: 3;\n    top: 0;\n    width: 8rem;\n    height: 100%;\n}\n\n.styles_sliderLeftControl__Vldnw {\n    left: -5.5rem;\n}\n\n.styles_sliderRightControl__2dvEO {\n    right: -5.5rem;\n}\n\n/* dark mode styles */\n.dark .styles_overlayLeft__1nT7n,\n.dark .styles_overlayRight__SDIqK {\n    background-color: #1f2a38;\n}\n\n.dark .styles_slider__1FAKF {\n    opacity: 0.2;\n}";
	var styles$1 = {"picker":"styles_picker__1g53n","chart":"styles_chart__1L2G1","chartLines":"styles_chartLines__1gmyb","overlayLeft":"styles_overlayLeft__1nT7n","overlayRight":"styles_overlayRight__SDIqK","slider":"styles_slider__1FAKF","sliderLeftControl":"styles_sliderLeftControl__Vldnw","sliderRightControl":"styles_sliderRightControl__2dvEO"};
	styleInject(css$1);

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
		constructor({ data, onRangeUpdate, props }) {
			const { lines } = data;

			this.props = { };
			this.data = data;
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

			this.onUpdate(props);
			this.bindHandlers();
			this.addListeners();
		}

		onUpdate(props) {
			const { x1, x2, hiddenLines } = props;

			if (x1 !== this.props.x1 || x2 !== this.props.x2) {
				setStyles(this.slider, {left: `${x1 * 100}%`, width: `${(x2 - x1) * 100}%`});
				setStyles(this.overlayLeft, {width: `calc(${x1 * 100}% + 2px)`});
				setStyles(this.overlayRight, {width: `calc(${100 - (x2 * 100)}% + 2px)`});
			}

			if (hiddenLines !== this.props.hiddenLines) {
				const max = Math.max(...this.data.lines.filter((line) => !hiddenLines[line.tag]).map((l) => l.max));

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

			this.props = props;
		}

		updateRange(x1 = this.props.x1, x2 = this.props.x2) {
			if (x1 === this.props.x1 && x2 === this.props.x2) {
				return
			}

			this.onRangeUpdate(x1, x2);
		}

		getEventX(e) {
			const { left, width } = this.rect.get();
			const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;

			return (x - left) / width
		}

		handlePointerMoveLeft(e) {
			if (e.cancelable) e.preventDefault();
			e.stopPropagation();
			const touchX = this.getEventX(e);
			const x1 = Math.min(Math.max(0, touchX), this.props.x2 - DEFAULT_RANGE);

			this.updateRange(x1);
		}

		handlePointerMoveRight(e) {
			if (e.cancelable) e.preventDefault();
			e.stopPropagation();
			const touchX = this.getEventX(e);
			const x2 = Math.max(Math.min(1, touchX), this.props.x1 + DEFAULT_RANGE);

			this.updateRange(undefined, x2);
		}

		handlePointerMove(e) {
			if (e.cancelable) e.preventDefault();
			e.stopPropagation();
			const touchX = this.getEventX(e);

			if (typeof this.prevX === 'number') {
				const dx = touchX - this.prevX;
				const x1 = this.props.x1 + dx;
				const x2 = this.props.x2 + dx;

				if (x1 > 0 && x2 < 1) {
					this.updateRange(x1, x2);
				}
			}

			this.prevX = touchX;
		}

		handleDrag(e) {
			switch (e.target) {
				case this.slider:
					this.handlePointerMove(e);
					break
				case this.sliderLeftControl:
					this.handlePointerMoveLeft(e);
					break
				case this.sliderRightControl:
					this.handlePointerMoveRight(e);
					break
			}
		}

		handleDragEnd() {
			this.prevX = null;
		}

		handleMouseMove(type, e) {
			if (this.dragging) {
				switch (type) {
					case 'left':
						this.handlePointerMoveLeft(e);
						break
					case 'right':
						this.handlePointerMoveRight(e);
						break
					case 'drag':
						this.handlePointerMove(e);
						break
				}
			}
		}

		handleMouseDown(type, e) {
			e.stopPropagation();
			this.dragging = true;
			const moveHandler = this.handleMouseMove.bind(this, type);

			document.addEventListener('mousemove', moveHandler);
			document.addEventListener('mouseup', this.handleMouseUp);

			this.stopDragging = () => {
				document.removeEventListener('mousemove', moveHandler);
				document.removeEventListener('mouseup', this.handleMouseUp);
			};
		}

		handleMouseUp() {
			if (this.dragging) {
				this.dragging = false;
				this.handleDragEnd();
				this.stopDragging();
			}
		}

		bindHandlers() {
			this.handlePointerMoveLeft = this.handlePointerMoveLeft.bind(this);
			this.handlePointerMoveRight = this.handlePointerMoveRight.bind(this);
			this.handlePointerMove = this.handlePointerMove.bind(this);
			this.handleDrag = this.handleDrag.bind(this);
			this.handleDragEnd = this.handleDragEnd.bind(this);
			this.handleMouseDown = this.handleMouseDown.bind(this);
			this.handleMouseMove = this.handleMouseMove.bind(this);
			this.handleMouseUp = this.handleMouseUp.bind(this);
			this.updateRange = this.updateRange.bind(this);
		}

		addListeners() {
			if (isTouchDevice()) {
				this.sliderLeftControl.addEventListener('touchmove', this.handleDrag);
				this.sliderRightControl.addEventListener('touchmove', this.handleDrag);
				this.slider.addEventListener('touchmove', this.handleDrag);
				this.slider.addEventListener('touchend', this.handleDragEnd);
			} else {
				this.slider.addEventListener('mousedown', this.handleMouseDown.bind(this, 'drag'));
				this.sliderLeftControl.addEventListener('mousedown', this.handleMouseDown.bind(this, 'left'));
				this.sliderRightControl.addEventListener('mousedown', this.handleMouseDown.bind(this, 'right'));
			}
		}
	}

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const dateString = (date) => `${months[date.getMonth()]}\u00a0${date.getDate()}`;

	const getDate = (ts) => dateString(new Date(ts));

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const getWeekDate = (ts) => {
		const date = new Date(ts);

		return `${days[date.getDay()]},\u00a0${dateString(date)}`
	};

	var css$2 = ".styles_container__3qbb9 {\n    position: absolute;\n    top: 0;\n    left: 0;\n    display: none;\n    width: 0.5rem;\n    height: 100%;\n    background-color: rgba(162, 173, 180, 0.4);\n}\n\n.styles_tooltip__1F_qS {\n    position: absolute;\n    top: 0;\n    left: -12rem;\n    z-index: 1;\n\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    width: auto;\n    height: 25%;\n    padding: 4rem 8rem;\n    box-sizing: border-box;\n    background-color: white;\n    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);\n    border-radius: 3rem;\n    transition: transform 0.2s ease;\n}\n\n.styles_point__3IY6W {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 6rem;\n    height: 6rem;\n    border: 1rem solid black;\n    border-radius: 50%;\n    box-sizing: border-box;\n    background-color: white;\n    transform: translate(-50%, 50%);\n}\n\n.styles_date__19e-x {\n    color: #333;\n    font-size: 10rem;\n}\n\n.styles_desc__26TU0 {\n    display: flex;\n}\n\n.styles_descItem__3sD6R {\n    display: flex;\n    flex-direction: column;\n    margin-right: 8rem;\n}\n\n.styles_descItem__3sD6R.styles_hidden__30Nr- {\n    display: none;\n    margin-right: 0;\n}\n\n.styles_descItem__3sD6R:not(.styles_hidden__30Nr-):last-child {\n    margin-right: 0;\n}\n\n.styles_value__2JuQs {\n    font-size: 12rem;\n}\n\n.styles_tag__iugF6 {\n    font-size: 6rem;\n}\n\n/* dark mode styles */\n.dark .styles_tooltip__1F_qS {\n    background-color: #242f3e;\n    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.3);\n}\n\n.dark .styles_date__19e-x {\n    color: white;\n}\n\n.dark .styles_point__3IY6W {\n    background-color: #242f3e;\n}";
	var styles$2 = {"container":"styles_container__3qbb9","tooltip":"styles_tooltip__1F_qS","point":"styles_point__3IY6W","date":"styles_date__19e-x","desc":"styles_desc__26TU0","descItem":"styles_descItem__3sD6R","hidden":"styles_hidden__30Nr-","value":"styles_value__2JuQs","tag":"styles_tag__iugF6"};
	styleInject(css$2);

	const template$1 = `
	<div class="${styles$2.container}">
		<div class="${styles$2.tooltip}">
			<div class="${styles$2.date}"></div>
			<div class="${styles$2.desc}"></div>
		</div>
	</div>
`;

	const pointTemplate = `<div class="${styles$2.point}"></div>`;
	const descItemTemplate = `<div class="${styles$2.descItem}"></div>`;

	const makeDescItemContent = ({ value, name }) => `
	<div class="${styles$2.value}">${formatValue(value)}</div>
	<div class="${styles$2.tag}">${name}</div>
`;

	class Tooltip {
		constructor() {
			this.element = htmlElement(template$1);
			this.tooltip = select(this.element, styles$2.tooltip);
			this.date = select(this.element, styles$2.date);
			this.desc = select(this.element, styles$2.desc);
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

				item.classList.toggle(styles$2.hidden, hidden);
				item.innerHTML = makeDescItemContent({
					value: line.value,
					name: line.name,
				});
			});

			setStyles(this.tooltip, {
				transform: `translate(${this.findTooltipXShift(rect)}px, 0px)`,
			});
		}

		hide() {
			setStyles(this.element, { display: 'none', left: `0%` });
			if (this.points) {
				this.points.forEach((p) => p.remove());
				this.points = null;
			}
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

	var css$3 = ".styles_grid__1z4Y9 {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    left: 0;\n    top: 0;\n    font-size: 3.5rem;\n}\n\n.styles_yAxis__7b-0Q {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n    pointer-events: none;\n}\n\n.styles_xAxis__3dPr_ {\n    position: absolute;\n    left: 0;\n    top: 100%;\n    width: 100%;\n    height: 18rem;\n    pointer-events: none;\n}\n\n.styles_yAxisItems__2JZ7W {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    transition: transform 0.4s ease, opacity 0.2s ease;\n    transform-origin: bottom;\n    opacity: 0;\n}\n\n.styles_yAxisItem__T1WfW {\n    position: absolute;\n    left: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100%;\n\n    display: flex;\n    align-items: flex-end;\n\n    color: #a2adb4;\n    font-size: 8rem;\n    line-height: 12rem;\n\n    border-bottom: 1px solid rgba(162, 173, 180, 0.3);\n}\n\n.styles_xAxisItem__2Wti7 {\n    position: absolute;\n    width: 2rem;\n    height: 18rem;\n    margin-left: -1rem;\n    bottom: 0;\n    left: 0;\n    text-align: center;\n    background-color: transparent;\n    color: #a2adb4;\n    font-size: 8rem;\n    line-height: 18rem;\n    white-space: nowrap;\n\n    display: none;\n    opacity: 1;\n    align-items: flex-end;\n    justify-content: center;\n    transition: opacity 0.4s ease;\n}";
	var styles$3 = {"grid":"styles_grid__1z4Y9","yAxis":"styles_yAxis__7b-0Q","xAxis":"styles_xAxis__3dPr_","yAxisItems":"styles_yAxisItems__2JZ7W","yAxisItem":"styles_yAxisItem__T1WfW","xAxisItem":"styles_xAxisItem__2Wti7"};
	styleInject(css$3);

	const template$2 = `
	<div class="${styles$3.grid}">
		<div class="${styles$3.yAxis}"></div>
		<div class="${styles$3.xAxis}"></div>
	</div>
`;

	const makeYAxis = (data, max, scale) => `
	<div class="${styles$3.yAxisItems}" style="transform: scaleY(${scale})">
		${data.map((value) => `
			<div
				class="${styles$3.yAxisItem}" 
				style="transform: translateY(-${100 * value / max}%)"
			>
				${formatValue(value)}
			</div>
		`).join('')}
	</div>
`;

	const makeXItem = (timestamp, x) => `
	<div 
		class="${styles$3.xAxisItem}" 
		style="left: ${x * 100}%"
	>
		${getDate(timestamp)}
	</div>
`;

	const digitsCount = (num) => {
		return (Math.log10((num ^ (num >> 31)) - (num >> 31)) | 0) + 1;
	};

	const getYItems = (max) => {
		const downscaledMax = 0.9 * max;
		const digits = digitsCount(downscaledMax);
		const divider = Math.pow(10, Math.max(0, digits - 2));
		const targetMax = Math.floor(downscaledMax / divider) * divider;
		const step = Math.floor(targetMax / 5);

		return [0, step, 2 * step, 3 * step, 4 * step, 5 * step]
	};

	function nearestPow2(num) {
		return Math.pow(2, Math.round(Math.log(num) / Math.log(2)))
	}

	const getStep = (tsCount, x1, x2) => {
		const initialStep = Math.round(DEFAULT_RANGE * tsCount / 5);
		const calculatedStep = Math.round((x2 - x1) * tsCount / 5);
		const scale = nearestPow2(calculatedStep / initialStep) || 1;

		console.log(tsCount, initialStep, calculatedStep);

		return { step: scale * initialStep, minStep: initialStep }
	};

	class Grid {
		constructor({ props, data, onTooltipStateChange }) {
			this.props = props;
			this.data = data;
			this.onTooltipStateChange = onTooltipStateChange;
			this.element = htmlElement(template$2);
			this.yAxis = select(this.element, styles$3.yAxis);
			this.xAxis = select(this.element, styles$3.xAxis);

			this.bindHandlers();
			this.initX();
			this.renderY = debounce(this.renderY, 200);
			this.renderY();
			this.renderX();
			this.tooltip = new Tooltip();
			this.element.appendChild(this.tooltip.element);
			this.rect = createRectStorage(this.element);
			this.addEventListeners();
		}

		bindHandlers() {
			this.renderY = this.renderY.bind(this);
			this.handlePointerOver = this.handlePointerOver.bind(this);
			this.handlePointerOut = this.handlePointerOut.bind(this);
			this.handleTouch = this.handleTouch.bind(this);
			this.handleTouchEnd = this.handleTouchEnd.bind(this);
			this.handleMouseMove = this.handleMouseMove.bind(this);
		}

		addEventListeners() {
			if (isTouchDevice()) {
				this.element.addEventListener('touchstart', this.handleTouch);
				this.element.addEventListener('touchmove', this.handleTouch);
				this.element.addEventListener('touchend', this.handleTouchEnd);
			} else {
				this.element.addEventListener('mousemove', this.handleMouseMove);
				this.element.addEventListener('mouseleave', this.handlePointerOut);
			}
		}

		onUpdate(props) {
			const { x1, x2, max } = this.props;
			this.props = props;

			if (max !== this.props.max) {
				this.renderY();
			}

			if (x1 !== this.props.x1 || x2 !== this.props.x2) {
				this.renderX();
			}
		}

		handleTouch(e) {
			if (this.touch) {
				this.handlePointerOver(e);
			} else if (!this.touchId) {
				this.touchId = setTimeout(() => {
					this.touch = true;
					this.handlePointerOver(e);
				}, 100);
			}
		}

		handleTouchEnd() {
			clearTimeout(this.touchId);
			this.touch = false;
			this.touchId = null;
			this.handlePointerOut();
		}

		handleMouseMove(e) {
			this.handlePointerOver(e);
		}

		handlePointerOver(e) {
			if (e.cancelable) e.preventDefault();
			e.stopPropagation();

			const rect = this.rect.get();
			const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
			const relativeX = Math.min(Math.max((x - rect.left) / rect.width, 0), 1);
			const index = Math.round(((this.props.x2 - this.props.x1) * relativeX + this.props.x1) * this.data.width);
			const coord = (index  / this.data.width - this.props.x1) / (this.props.x2 - this.props.x1);

			if (!this.props.withTooltip) {
				this.onTooltipStateChange(true);
			}

			this.tooltip.show({
				x: coord,
				hiddenLines: this.props.hiddenLines,
				timestamp: this.data.timestamps[index],
				lines: this.data.lines.map(({ points, ...l }) => ({
					...l,
					point: points[index].y / this.props.max,
					value: points[index].y,
				})),
				rect,
			});
		}

		handlePointerOut() {
			this.tooltip.hide();

			if (this.props.withTooltip) {
				this.onTooltipStateChange(false);
			}
		}

		initX() {
			const { timestamps } = this.data;

			this.timestamps = timestamps.map((ts, index) => htmlElement(makeXItem(ts, index / (timestamps.length - 1))));
			this.timestamps.forEach((node) => this.xAxis.appendChild(node));
		}

		renderX() {
			const { x1, x2 } = this.props;
			const { timestamps } = this.data;
			const width = 100 / (x2 - x1);
			const first = Math.max(Math.round(x1 * timestamps.length), 0);
			const last = Math.min(Math.round(x2 * timestamps.length), timestamps.length - 1);
			const { step, minStep } = getStep(timestamps.length, x1, x2);

			this.timestamps.forEach((node, index) => {
				const visible = ((index + 2) >= first && (index - 2) <= last) && (timestamps.length - index - 2) % minStep === 0;
				node.style.display = visible ? 'flex' : 'none';

				if (visible && (timestamps.length - index - 2) % step === 0) {
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

		renderY() {
			const { max } = this.props;
			const prevItems = this.yAxisItems;

			const data = getYItems(max);
			this.yAxisItems = {
				element: htmlElement(makeYAxis(data, max, max / (prevItems ? prevItems.max : max))),
				max,
			};
			this.yAxis.appendChild(this.yAxisItems.element);

			const newElement = this.yAxisItems.element;

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setStyles(newElement, {
						transform: `scaleY(1)`,
						opacity: '1',
					});

					if (prevItems) {
						setStyles(prevItems.element, {
							transform: `scaleY(${prevItems.max / max})`,
							opacity: '0',
						});

						prevItems.element.addEventListener('transitionend', () => prevItems.element.remove(), false);
					}
				});
			});
		}
	}

	var css$4 = ".styles_container__3Tw62 {\n    width: 100%;\n    padding: 8rem;\n    height: auto;\n    box-sizing: border-box;\n    overflow: hidden;\n}\n\n@media (min-aspect-ratio: 1/1) {\n    .styles_container__3Tw62 {\n        padding: 0 20%;\n    }\n}\n\n.styles_title__2C1xN {\n    font-size: 12rem;\n    font-weight: 600;\n    margin-bottom: 14rem;\n}\n\n.styles_chart__1MvQy {\n    position: relative;\n    width: 100%;\n    height: 40vh;\n    margin-bottom: 24rem;\n}\n\n.styles_lines__XIx1X {\n    position: absolute;\n    top: 0;\n    height: 100%;\n}\n\n.styles_toggles__1iKKZ {\n    display: flex;\n    flex-wrap: wrap;\n    margin-top: 12rem;\n}\n\n.styles_toggle__1yMSt {\n    margin-right: 10rem;\n    margin-bottom: 10rem;\n}\n\n.styles_toggleLabel__6S6Jy {\n    display: flex;\n    height: 22rem;\n    padding: 5rem 7rem 5rem 5rem;\n    border: 1px solid rgba(162, 173, 180, 0.8);\n    border-radius: 12rem;\n    box-sizing: border-box;\n    font-size: 10rem;\n    font-weight: lighter;\n    line-height: 12rem;\n    color: #333;\n    transition: opacity 0.2s ease;\n}\n\n.styles_checkBlock__2wBM9 {\n    position: relative;\n    width: 12rem;\n    height: 12rem;\n    padding: 1rem;\n    margin-right: 6rem;\n    border-radius: 6rem;\n    box-sizing: border-box;\n}\n\n.styles_checkBg__3-TkC {\n    width: 10rem;\n    height: 10rem;\n    border-radius: 5rem;\n    background-color: white;\n    transition: transform 0.2s ease;\n}\n\n.styles_check__15gOg {\n    position: absolute;\n    top: calc(50% - 4rem);\n    left: calc(50% - 4rem);\n    width: 8rem;\n    height: 8rem;\n    fill: white;\n    stroke-width: 0.5rem;\n    stroke: white;\n    transform: scale(0);\n    transition: transform 0.2s ease;\n}\n\n.styles_toggleInput__1JrFl {\n    visibility: hidden;\n    width: 0;\n    height: 0;\n    margin: 0;\n}\n\n.styles_toggleInput__1JrFl:checked + .styles_toggleLabel__6S6Jy .styles_checkBg__3-TkC {\n    transform: scale(0);\n}\n\n.styles_toggleInput__1JrFl:checked + .styles_toggleLabel__6S6Jy .styles_check__15gOg {\n    transform: scale(1);\n}\n\n.styles_toggleInput__1JrFl:disabled + .styles_toggleLabel__6S6Jy {\n    opacity: 0.5;\n}\n\n/* dark mode styles */\n.dark .styles_title__2C1xN {\n    color: white;\n}\n\n.dark .styles_toggleLabel__6S6Jy {\n    color: white;\n}\n\n.dark .styles_checkBg__3-TkC {\n    background-color: #242f3e;\n}";
	var styles$4 = {"container":"styles_container__3Tw62","title":"styles_title__2C1xN","chart":"styles_chart__1MvQy","lines":"styles_lines__XIx1X","toggles":"styles_toggles__1iKKZ","toggle":"styles_toggle__1yMSt","toggleLabel":"styles_toggleLabel__6S6Jy","checkBlock":"styles_checkBlock__2wBM9","checkBg":"styles_checkBg__3-TkC","check":"styles_check__15gOg","toggleInput":"styles_toggleInput__1JrFl"};
	styleInject(css$4);

	const template$3 = `<div class="${styles$4.toggles}"></div>`;

	const makeLine = (id, line) => `
	<div class="${styles$4.toggle}">
		<input id="${id + line.tag}" class="${styles$4.toggleInput}" type="checkbox" checked>
		<label for="${id + line.tag}" class="${styles$4.toggleLabel}">
			<div class="${styles$4.checkBlock}" style="background-color: ${line.color}">
				<div class="${styles$4.checkBg}"></div>
				<svg class="${styles$4.check}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path d="M 19.28125 5.28125 L 9 15.5625 L 4.71875 11.28125 L 3.28125 12.71875 L 8.28125 17.71875 L 9 18.40625 L 9.71875 17.71875 L 20.71875 6.71875 Z "/>
				</svg>
			</div>
			${line.name}
		</label>
	</div>
`;

	class Toggles {
		constructor({ lines, onHiddenLinesUpdate, state }) {
			this.id = uuid();
			this.state = state;
			this.lines = lines;
			this.element = htmlElement(template$3);
			this.toggles = lines.map((line) => {
				const element = htmlElement(makeLine(this.id, line));

				return {
					element: element,
					input: select(element, styles$4.toggleInput),
					line,
				}
			});
			this.toggles.forEach((toggle) => {
				toggle.input.addEventListener('change', this.handleChange.bind(this, toggle.line));
				this.element.appendChild(toggle.element);
			});
			this.hiddenLines = { };

			this.onHiddenLinesUpdate = onHiddenLinesUpdate;
		}

		handleChange(line, e) {
			const hidden = !e.target.checked;

			this.onHiddenLinesUpdate({
				...this.state.hiddenLines,
				[line.tag]: hidden,
			});
		}

		onUpdate(state) {
			this.state = state;
			this.updateDisabledToggle();
		}

		updateDisabledToggle() {
			const visibleLines = this.lines.filter((l) => !this.state.hiddenLines[l.tag]);

			if (visibleLines.length === 1) {
				const tag = visibleLines[0].tag;
				const { input } = this.toggles.find((toggle) => toggle.line.tag === tag);

				input.disabled = true;
			} else {
				this.toggles.forEach((toggle) => {
					toggle.input.disabled = false;
				});
			}
		}
	}

	const BIG_SCREEN_QUERY = '(min-aspect-ratio: 1/1), (max-width: 960px)';

	const getMax = (data, { x1, x2, hiddenLines, withTooltip }) => {
		const maxItem = getMaxItem(
			data.lines.filter((line) => !hiddenLines[line.tag]).reduce((points, l) =>
					points.concat(l.points.filter((p) => {
						const relX = p.x / l.points.length;

						return relX >= x1 && relX <= x2
					})),
				[]),
			(p) => p.y
		);

		return (withTooltip ? 1.4 : 1) * maxItem.y
	};

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
				x1: 1 - DEFAULT_RANGE,
				x2: 1,
				hiddenLines: { },
				withTooltip: false,
			};

			this.state.max = getMax(data, this.state);

			this.data = data;
			this.element = htmlElement(makeTemplate(title));
			this.chartElement = select(this.element, styles$4.chart);
			this.linesElement = select(this.element, styles$4.lines);
			this.setLinesShift();

			this.lines = lines.map((lineData) => new Polyline(lineData));
			this.lines.forEach((line) => this.linesElement.appendChild(line.element));

			this.bindListeners();

			this.grid = new Grid({
				props: this.state,
				data,
				onTooltipStateChange: this.onTooltipStateChange,
			});
			this.chartElement.appendChild(this.grid.element);
			this.slider = new RangePicker({ data, onRangeUpdate: this.onRangeUpdate, props: this.state });
			this.element.appendChild(this.slider.element);
			this.toggles = new Toggles({
				lines,
				onHiddenLinesUpdate: this.onHiddenLinesUpdate,
				state: this.state,
			});
			this.element.appendChild(this.toggles.element);

			const mq = window.matchMedia(BIG_SCREEN_QUERY);

			this.onMediaQueryChange(mq);
			mq.addListener(this.onMediaQueryChange);
			this.onUpdate();
		}

		bindListeners() {
			this.onRangeUpdate = this.onRangeUpdate.bind(this);
			this.onHiddenLinesUpdate = this.onHiddenLinesUpdate.bind(this);
			this.onTooltipStateChange = this.onTooltipStateChange.bind(this);
			this.onMediaQueryChange = this.onMediaQueryChange.bind(this);
		}

		setLinesShift() {
			setStyles(this.linesElement, {
				left: `${-100 * this.margin}%`,
				width: `${100 * (1 + 2 * this.margin)}%`,
			});
		}

		onHiddenLinesUpdate(hiddenLines) {
			this.updateState({ hiddenLines });
		}

		onRangeUpdate(x1, x2) {
			this.updateState({ x1, x2 });
		}

		onTooltipStateChange(withTooltip) {
			this.updateState({ withTooltip });
		}

		onMediaQueryChange(mq) {
			this.margin = mq.matches ? 0 : 0.1;
			this.setLinesShift();
		}

		updateState(obj) {
			this.state = Object.assign({}, this.state, obj);
			this.state.max = getMax(this.data, this.state);

			this.grid.onUpdate(this.state);
			this.slider.onUpdate(this.state);
			this.toggles.onUpdate(this.state);
			this.onUpdate();
		}

		onUpdate() {
			const { x1, x2, max, hiddenLines } = this.state;
			console.log('MAX', max);
			const margin = (x2 - x1) * this.margin;
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

	var css$5 = "html,\nbody,\n#root,\n.charts_container__An6op {\n    width: 100%;\n    height: 100%;\n    padding: 0;\n    margin: 0;\n    position: fixed;\n    overflow: hidden;\n    font-size: 4px;\n    font-family: sans-serif;\n}\n\n* {\n    user-select: none;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n}\n\n.charts_container__An6op {\n    background-color: white;\n    -webkit-overflow-scrolling: touch;\n    /*transition: background-color 0.2s ease;*/\n}\n\n.charts_container__An6op.dark {\n    background-color: #242f3e;\n}\n\n.charts_charts__2gh4S {\n    width: 100%;\n    height: 100%;\n    padding-bottom: 12vh;\n    box-sizing: border-box;\n    overflow-y: auto;\n}\n\n.charts_themeToggle__2ES9w {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 10vh;\n    background-color: white;\n    font-size: 12rem;\n    color: #188ee3;\n    border: 0;\n    outline: none;\n    padding: 0;\n    box-shadow: 0 -10rem 10rem white;\n    /*transition-property: background-color, box-shadow;*/\n    /*transition-duration: 0.15s;*/\n    /*transition-timing-function: ease;*/\n}\n\n.dark .charts_themeToggle__2ES9w {\n    background-color: #242f3e;\n    box-shadow: 0 -10rem 10rem #242f3e;\n}\n\n@media (min-aspect-ratio: 1/1), (max-width: 960px) {\n    html {\n        font-size: 2px;\n    }\n}";
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
//# sourceMappingURL=bundle-[hash].js.map