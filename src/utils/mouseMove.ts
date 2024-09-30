import { on } from './betterListener';

let event: MouseEvent;

type MouseListener = (position: MouseEvent) => any;

export const createMouseListener = () => {
	let mouseListeners: MouseListener[] = [];

	const update = () => mouseListeners.forEach((fn) => fn(event));

	const eventListeners = [
		on('mousemove', (e) => (event = e)),
		on('mousemove', update),
		on('resize', update),
		on('scroll', update)
	];

	const listen = (fn: MouseListener) => {
		mouseListeners.push(fn);
		eventListeners.forEach((e) => e.start());
	};

	const kill = () => {
		mouseListeners = [];
		eventListeners.forEach((e) => e.stop());
	};

	return { event, listen, kill };
};
