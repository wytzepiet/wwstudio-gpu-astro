import gsap from 'gsap';
import ScrollSmoother from 'gsap/dist/ScrollSmoother';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { queryOne } from './generalUtils';

type Subscriber = (progress?: number) => {};
const subscribers: Subscriber[] = [];

export const scroller = {
	top: 0,
	subscribe: (fn: Subscriber) => {
		subscribers.push(fn);
	},
	update: (top: number) => {
		scroller.top = top;
		subscribers.forEach((fn) => fn(scroller.top));
	},
	to: (target: number) => window!.scrollTo(0, target)
};
