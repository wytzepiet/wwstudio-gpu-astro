export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const queryAll = (q: string) => document.querySelectorAll(q) as NodeListOf<HTMLElement>;

export const queryOne = (q: string) => document.querySelector(q) as HTMLElement | null;

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
