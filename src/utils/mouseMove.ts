import { on } from './betterListener';

let event: MouseEvent;

type MouseListener = (position: MouseEvent) => any;

export const createMouseListener = () => {
	let mouseListeners: MouseListener[] = [];

	const update = () => event && mouseListeners.forEach((fn) => fn(event));

	const eventListeners = [
		on('mousemove', (e) => (event = e)),
		on('mousemove', () => update()),
		on('resize', () => update()),
		on('scroll', () => update())
	];

	const listen = (fn: MouseListener) => {
		mouseListeners.push(fn);
		eventListeners.forEach((e) => e.start());
	};

	const kill = () => {
		mouseListeners = [];
		eventListeners.forEach((e) => e.stop());
	};

	const intersects = (el: HTMLElement) => {
		if (!event) return false;
		const rect = el.getBoundingClientRect();
		const { clientX: x, clientY: y } = event;
		return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
	};

	return { event, listen, kill, intersects };
};
