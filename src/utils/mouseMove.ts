import { on } from './betterListener';

let position = { x: 0, y: 0 };

type Position = typeof position;
type MouseListener = (position: Position) => any;

export const createMouseListener = () => {
	let mouseListeners: MouseListener[] = [];

	const update = () => mouseListeners.forEach((fn) => fn(position));

	const eventListeners = [
		on('mousemove', (e) => (position = { x: e.clientX, y: e.clientY })),
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

	return { position, listen, kill };
};
