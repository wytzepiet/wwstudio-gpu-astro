/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				moneta: ['Moneta', 'serif'],
				archive: ['Archive', 'sans-serif'],
				hero: ['Hero', 'sans-serif'],
				'space-mono': ['Space Mono', 'monospace'],
				'jetbrains-mono': ['Jetbrains Mono', 'monospace'],
				'alanta-rosery': ['Alanta Rosery', 'serif'],
				tektur: ['Tektur Variable', 'sans-serif']
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--foreground) / 0.12)',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))',
					5: 'hsl(var(--chart-5))'
				},
				vibrant: 'hsl(215deg 100% 91.26%)'
			},
			borderRadius: {
				lg: 'var(--radius * 2)',
				md: 'calc(var(--radius))',
				sm: 'calc(var(--radius) * 0.5)'
			},
			fontSize: {
				// text-xs	font-size: 0.75rem; /* 12px */
				// line-height: 1rem; /* 16px */
				// text-sm	font-size: 0.875rem; /* 14px */
				// line-height: 1.25rem; /* 20px */
				// text-base	font-size: 1rem; /* 16px */
				// line-height: 1.5rem; /* 24px */
				// text-lg	font-size: 1.125rem; /* 18px */
				// line-height: 1.75rem; /* 28px */
				// text-xl	font-size: 1.25rem; /* 20px */
				// line-height: 1.75rem; /* 28px */
				// text-2xl	font-size: 1.5rem; /* 24px */
				// line-height: 2rem; /* 32px */
				// text-3xl	font-size: 1.875rem; /* 30px */
				// line-height: 2.25rem; /* 36px */
				// text-4xl	font-size: 2.25rem; /* 36px */
				// line-height: 2.5rem; /* 40px */
				// text-5xl	font-size: 3rem; /* 48px */
				// line-height: 1;
				// text-6xl	font-size: 3.75rem; /* 60px */
				// line-height: 1;
				// text-7xl	font-size: 4.5rem; /* 72px */
				// line-height: 1;
				// text-8xl	font-size: 6rem; /* 96px */
				// line-height: 1;
				// text-9xl	font-size: 8rem; /* 128px */
				// line-height: 1;

				xl: ['calc(1.25 * var(--var-size))', 1],
				'2xl': ['calc(1.5 * var(--var-size))', 1],
				'3xl': ['calc(1.875 * var(--var-size))', 1],
				'4xl': ['calc(2.25 * var(--var-size))', 1],
				'5xl': ['calc(3 * var(--var-size))', 1],
				'6xl': ['calc(3.75 * var(--var-size))', 1],
				'7xl': ['calc(4.5 * var(--var-size))', 1],
				'8xl': ['calc(6 * var(--var-size))', 1],
				'9xl': ['calc(8 * var(--var-size))', 1]
			}
		}
	},
	plugins: [require('tailwindcss-animate'), require('tailwindcss-3d')]
};
