import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'SF Pro',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Helvetica',
					'Apple Color Emoji',
					'Arial',
					'sans-serif',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
				],
				serif: [
					'Lyon-Text',
					'Georgia',
					'YuMincho',
					'Yu Mincho',
					'Hiragino Mincho ProN',
					'Hiragino Mincho Pro',
					'Songti TC',
					'Songti SC',
					'SimSun',
					'Nanum Myeongjo',
					'NanumMyeongjo',
					'Batang',
					'serif',
				],
				mono: ['iawriter-mono', 'Nitti', 'Menlo', 'Courier', 'monospace'],
				code: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'],
			},

			colors: {
				white: '#f7f7f7',
				gray_one: '#f9f9f9',
				gray_two: '#262624',
				error_red: '#e33f3f',
				beige: '#eeecda',
				green: '#008044',
				purple: '#98479a',
			},
			textColor: {
				gray_one: '#737373',
				dark_two: '#d9d9d9',
			},
		},
	},
	plugins: [
		plugin(function ({ addUtilities, theme }) {
			// Custom tailwind properties
			const scrollbarUtilities = {
				// Removing the scrollbar
				'.scrollbar-hide': {
					/* Firefox */
					'scrollbar-width': 'none',
					/* Safari and Chrome */
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
				'.scrollbar-thin': {
					'scrollbar-width': 'thin',
					'&::-webkit-scrollbar': {
						width: '4px',
						height: '4px',
					},
					'&::-webkit-scrollbar-track': {
						background: 'transparent',
					},
					'&::-webkit-scrollbar-thumb': {
						background: theme('border.c_one') as string,
						borderRadius: '20px',
					},
				},
			};
			addUtilities(scrollbarUtilities);
		}),
	],
};

export default config;
