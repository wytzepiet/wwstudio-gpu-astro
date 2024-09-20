export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const query = (q: string) => document.querySelectorAll(q) as NodeListOf<HTMLElement>;

export const queryFirst = (q: string) => document.querySelector(q) as HTMLElement | null;
