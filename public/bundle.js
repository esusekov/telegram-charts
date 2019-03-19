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

	var css = ".styles_line__3zwDO {\n    opacity: 1;\n    transition: opacity 0.4s ease;\n}";
	var styles = {"line":"styles_line__3zwDO"};
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
				'stroke-width': '5px',
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

	var css$1 = ".styles_picker__2sIRv {\n    position: relative;\n    width: 100%;\n    height: 7vh;\n    contain: layout style paint;\n}\n\n.styles_chart__2MgZt {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n}\n\n.styles_chartLines__2JQ8- {\n    width: 100%;\n    height: 100%;\n}\n\n.styles_overlayLeft__3o5uq,\n.styles_overlayRight__1CNMA {\n    position: absolute;\n    z-index: 1;\n    top: 0;\n    width: 100%;\n    height: 100%;\n    background-color: #f5f9fb;\n    opacity: 0.9;\n}\n\n.styles_overlayLeft__3o5uq {\n    left: 0;\n}\n\n.styles_overlayRight__1CNMA {\n    right: 0;\n}\n\n.styles_slider__1-a_B {\n    position: absolute;\n    z-index: 2;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    box-sizing: border-box;\n    border-color: #ddeaf3;\n    border-style: solid;\n    border-width: 2px 10px;\n    opacity: 0.9;\n}\n\n.styles_sliderLeftControl__3GfHi,\n.styles_sliderRightControl__amJ6B {\n    position: absolute;\n    z-index: 3;\n    top: 0;\n    width: 30px;\n    height: 100%;\n}\n\n.styles_sliderLeftControl__3GfHi {\n    left: -15px;\n}\n\n.styles_sliderRightControl__amJ6B {\n    right: -15px;\n}";
	var styles$1 = {"picker":"styles_picker__2sIRv","chart":"styles_chart__2MgZt","chartLines":"styles_chartLines__2JQ8-","overlayLeft":"styles_overlayLeft__3o5uq","overlayRight":"styles_overlayRight__1CNMA","slider":"styles_slider__1-a_B","sliderLeftControl":"styles_sliderLeftControl__3GfHi","sliderRightControl":"styles_sliderRightControl__amJ6B"};
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
			this.onRangeUpdate = onRangeUpdate;
			this.chartElement = select(this.element, styles$1.chart);

			this.lines = lines
				.map((lineData) => new Polyline(lineData, { 'stroke-width': '2px' }));

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

		handleDragLeft(e) {
			if (e.target === this.sliderLeftControl) {
				const touchX = e.touches[0].clientX / this.element.offsetWidth;
				const x1 = Math.min(Math.max(0, touchX), this.state.x2 - 0.1);

				this.updateRange(x1);
			}
		}

		handleDragRight(e) {
			if (e.target === this.sliderRightControl) {
				const touchX = e.touches[0].clientX / this.element.offsetWidth;
				const x2 = Math.max(Math.min(1, touchX), this.state.x1 + 0.1);

				this.updateRange(undefined, x2);
			}
		}

		handleDrag(e) {
			if (e.target === this.slider) {
				const touchX = e.touches[0].clientX / this.element.offsetWidth;

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

	var css$2 = ".styles_grid__3TI0a {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    left: 0;\n    top: 0;\n}\n\n.styles_yAxis__1CUqp {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n}\n\n.styles_xAxis__3HrqG {\n    position: absolute;\n    width: 100%;\n    height: calc(100% + 4rem);\n}\n\n.styles_yAxisItems__3gMBz {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n}\n\n.styles_yAxisItem__2ChqT {\n    position: absolute;\n    left: 0;\n    bottom: 0;\n    width: 100%;\n    height: 100%;\n\n    display: flex;\n    align-items: flex-end;\n\n    color: #a2adb4;\n    font-size: 2.5rem;\n    line-height: 4rem;\n\n    border-bottom: 1px solid rgba(162, 173, 180, 0.5);\n}\n\n.styles_xAxisItem__3ZrZb {\n    position: absolute;\n    width: 2rem;\n    height: 100%;\n    margin-left: -1rem;\n    bottom: 0;\n    left: 0;\n    text-align: center;\n    background-color: transparent;\n    color: #a2adb4;\n    font-size: 2.5rem;\n    line-height: 4rem;\n    white-space: nowrap;\n\n    display: none;\n    opacity: 1;\n    align-items: flex-end;\n    justify-content: center;\n}";
	var styles$2 = {"grid":"styles_grid__3TI0a","yAxis":"styles_yAxis__1CUqp","xAxis":"styles_xAxis__3HrqG","yAxisItems":"styles_yAxisItems__3gMBz","yAxisItem":"styles_yAxisItem__2ChqT","xAxisItem":"styles_xAxisItem__3ZrZb"};
	styleInject(css$2);

	const template$1 = `
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

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const getDate = (ts) => {
		const date = new Date(ts);

		return `${months[date.getMonth()]} ${date.getDate()}`
	};

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
		constructor(data, { x1, x2, max }) {
			this.element = htmlElement(template$1);
			this.yAxis = select(this.element, styles$2.yAxis);
			this.xAxis = select(this.element, styles$2.xAxis);
			this.max = max;
			this.x1 = x1;
			this.x2 = x2;
			this.data = data;
			this.renderY(max);
			this.initX();
			this.renderX(x1, x2);
		}

		onUpdate({ x1, x2, max }) {
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

		renderY(max) {
			if (this.yAxisItems) {
				this.yAxisItems.remove();
			}

			const data = getYItems(max);
			this.yAxisItems = htmlElement(makeYAxis(data));
			this.yAxis.appendChild(this.yAxisItems);
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
	}

	var css$3 = ".styles_container__3Tw62 {\n    width: 100%;\n    height: 70vh;\n    overflow: hidden;\n}\n\n.styles_chart__1MvQy {\n    position: relative;\n    width: 100%;\n    height: 50vh;\n    margin-bottom: 5vh;\n}\n\n.styles_lines__XIx1X {\n    width: 100%;\n    height: 100%;\n}\n\n.styles_toggles__1iKKZ {\n    display: flex;\n}\n\n.styles_toggle__1yMSt {\n    font-size: 2.5rem;\n}\n\n\n.styles_toggle__1yMSt input {\n    font-size: 2.5rem;\n}";
	var styles$3 = {"container":"styles_container__3Tw62","chart":"styles_chart__1MvQy","lines":"styles_lines__XIx1X","toggles":"styles_toggles__1iKKZ","toggle":"styles_toggle__1yMSt"};
	styleInject(css$3);

	const template$2 = (lines) => `
	<div class="${styles$3.toggles}">
		${lines.map((line) => `
			<label class="${styles$3.toggle}" style="color: ${line.color}">
				<input type="checkbox" data-line="${line.tag}" checked>
				${line.name}
			</label>
		`).join('')}
	</div>
`;

	class Toggles {
		constructor(lines, onHiddenLinesUpdate, state) {
			this.state = state;
			this.element = htmlElement(template$2(lines));

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

	const template$3 = `
	<div class="${styles$3.container}">
		<div class="${styles$3.chart}">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="${styles$3.lines}"
				preserveAspectRatio="none"
			></svg>
		</div>
	</div>
`;

	class Chart {
		constructor(data) {
			const { lines } = data;

			this.state = {
				x1: 0.9,
				x2: 1,
				hiddenLines: { },
			};

			this.state.max = getMax(data, this.state).y;

			this.data = data;
			this.element = htmlElement(template$3);

			this.chartElement = select(this.element, styles$3.chart);
			this.linesElement = select(this.element, styles$3.lines);

			this.lines = lines.map((lineData) => new Polyline(lineData));
			this.lines.forEach((line) => this.linesElement.appendChild(line.element));

			this.grid = new Grid(data, this.state);
			this.chartElement.appendChild(this.grid.element);

			this.onRangeUpdate = this.onRangeUpdate.bind(this);
			this.slider = new RangePicker(data, this.onRangeUpdate, this.state);
			this.element.appendChild(this.slider.element);

			this.onHiddenLinesUpdate = this.onHiddenLinesUpdate.bind(this);
			this.toggles = new Toggles(lines, this.onHiddenLinesUpdate, this.state);
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
			const viewBox = {
				xMin: x1 * this.data.width,
				xMax: (x2 - x1) * this.data.width,
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

	const formatChartData = (data) => {
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

		const width = timestamps.length;
		const height = getMaxItem(lines, (line) => line.max).max;

		return { width, height, lines, timestamps }
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

	var css$4 = "html,\nbody,\n#root {\n    width: 100%;\n    height: 100%;\n    padding: 0;\n    margin: 0;\n    position: fixed;\n    overflow: hidden;\n}\n\n.charts_charts__2gh4S {\n    width: 100%;\n    height: 100%;\n    overflow-y: auto;\n}";
	var styles$4 = {"charts":"charts_charts__2gh4S"};
	styleInject(css$4);

	class Charts {
		constructor(root, data) {
			this.element = document.createElement('div');
			this.element.classList.add(styles$4.charts);
			root.appendChild(this.element);

			this.element.appendChild(new Chart(data[0]).element);
			this.element.appendChild(new Chart(data[1]).element);
		}
	}

	const init = async () => {
		const data = await getData();

		new Charts(document.getElementById('root'), data);
	};

	init();

}());
