/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				moneta: ['Moneta', 'serif'],
				archive: ['Archive', 'sans-serif'],
				hero: ['Hero', 'sans-serif'],
			}
		}
	},
	plugins: [],
}
