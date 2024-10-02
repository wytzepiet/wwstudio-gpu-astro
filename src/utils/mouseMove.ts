import { on } from './betterListener';

let event: MouseEvent;

type MouseListener = (position: MouseEvent) => any;

export const createMouseListener = () => {
	let mouseListeners: MouseListener[] = [];

	const update = (e: MouseEvent) => mouseListeners.forEach((fn) => fn(e));

	const eventListeners = [on('mousemove', (e) => update(e))];

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
