import { listen, type BetterListener } from './betterListener';

let position = { x: 0, y: 0 };

type Position = typeof position;
type MouseListener = (position: Position) => any;

export const createMouseListener = () => {
	let mouseListeners: MouseListener[] = [];

	const update = () => mouseListeners.forEach((fn) => fn(position));

	const eventListeners = [
		listen('mousemove', (e) => (position = { x: e.clientX, y: e.clientY })),
		listen('mousemove', update),
		listen('resize', update),
		listen('scroll', update)
	];

	const onMove = (fn: MouseListener) => {
		mouseListeners.push(fn);
		eventListeners.forEach((e) => e.start());
	};

	const stopListening = () => {
		mouseListeners = [];
		eventListeners.forEach((e) => e.stop());
	};

	return { position, onMove, stopListening };
};
