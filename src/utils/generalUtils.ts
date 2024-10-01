export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createQuery = (el: Document | Element) => ({
	one: (q: string) => el.querySelector(q) as HTMLElement | null,
	all: (q: string) => [...el.querySelectorAll(q)] as HTMLElement[]
});

export const query = createQuery(document);
