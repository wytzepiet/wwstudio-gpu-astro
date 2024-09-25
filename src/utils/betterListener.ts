export function on<K extends keyof WindowEventMap>(type: K, event: (this: Window, ev: WindowEventMap[K]) => any) {
	let listening = false;

	const stop = () => {
		if (listening) window.removeEventListener(type, event);
		listening = false;
	};
	const start = () => {
		if (!listening) window.addEventListener(type, event);
		listening = true;
	};
	start();
	return { stop, start, listening };
}

export type BetterListener = ReturnType<typeof on>;
