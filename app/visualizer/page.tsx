'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ColorBlob {
	x: number;
	y: number;
	radius: number;
	color: [number, number, number];
	dx: number;
	dy: number;
	radiusSpeed: number;
	baseRadius: number;
}


export default function ColorPaletteGenerator() {
	const searchParams = useSearchParams();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const blobsRef = useRef<ColorBlob[]>([]);
	const timeRef = useRef<number>(0);

	const [isLoading, setIsLoading] = useState(true);
	const [numBlobs, setNumBlobs] = useState<number>(4);

	// Color palettes to choose from
	const colorPalettes = [
		[
			[255, 182, 193],
			[144, 238, 144],
			[255, 218, 185],
			[221, 160, 221],
		], // Pink, Light Green, Peach, Plum
		[
			[255, 99, 132],
			[54, 162, 235],
			[255, 205, 86],
			[75, 192, 192],
		], // Red, Blue, Yellow, Teal
		[
			[255, 159, 64],
			[153, 102, 255],
			[255, 99, 132],
			[54, 162, 235],
		], // Orange, Purple, Pink, Blue
		[
			[201, 203, 207],
			[255, 99, 132],
			[255, 159, 64],
			[255, 205, 86],
		], // Gray, Red, Orange, Yellow
		[
			[75, 192, 192],
			[153, 102, 255],
			[255, 159, 64],
			[255, 99, 132],
		], // Teal, Purple, Orange, Red
	];

	const generateBlobs = useCallback(
		(width: number, height: number) => {
			let palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

			if (searchParams) {
				const colorsStr = searchParams.get('colors');

				if (colorsStr) {
					const colors = JSON.parse(colorsStr) as string[];

					if (colors) {
						palette = colors.map(hex => {
							const cleanHex = hex.replace('#', '');
							const r = parseInt(cleanHex.substr(0, 2), 16);
							const g = parseInt(cleanHex.substr(2, 2), 16);
							const b = parseInt(cleanHex.substr(4, 2), 16);
							return [r, g, b];
						});
					}
				}
			}

			const blobs: ColorBlob[] = [];
			for (let i = 0; i < numBlobs; i++) {
				const baseRadius = Math.min(width, height) * (0.08 + Math.random() * 0.15);
				blobs.push({
					x: Math.random() * width,
					y: Math.random() * height,
					radius: baseRadius,
					color: palette[i],
					dx: (Math.random() - 0.5) * 0.5,
					dy: (Math.random() - 0.5) * 0.5,
					radiusSpeed: 0.01 + Math.random() * 0.02,
					baseRadius: baseRadius,
				});
			}

			blobsRef.current = blobs;
		},
		[numBlobs],
	);

	const resizeCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;

		if (!canvas || !container) return;

		const width = container.clientWidth;
		const height = container.clientHeight;

		canvas.width = width;
		canvas.height = height;

		generateBlobs(width, height);
	}, [generateBlobs]);

	const updateBlobs = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		timeRef.current += 0.01;

		blobsRef.current.forEach((blob, index) => {
			// Update position with gentle movement
			blob.x += blob.dx;
			blob.y += blob.dy;

			// Bounce off edges with some padding
			const padding = blob.radius * 0.5;
			if (blob.x < padding || blob.x > canvas.width - padding) {
				blob.dx *= -1;
				blob.x = Math.max(padding, Math.min(canvas.width - padding, blob.x));
			}
			if (blob.y < padding || blob.y > canvas.height - padding) {
				blob.dy *= -1;
				blob.y = Math.max(padding, Math.min(canvas.height - padding, blob.y));
			}

			// Animate radius with sine wave
			blob.radius = blob.baseRadius + Math.sin(timeRef.current + index * 2) * blob.baseRadius * 0.2;
		});
	}, []);

	const getColorAtPixel = useCallback((x: number, y: number): [number, number, number] => {
		let totalWeight = 0;
		let r = 0,
			g = 0,
			b = 0;

		blobsRef.current.forEach(blob => {
			const distance = Math.sqrt((x - blob.x) ** 2 + (y - blob.y) ** 2);

			// Use ultra-smooth falloff function for very soft, rounded blending
			// bruv
			const influence = blob.radius * 2.5;
			let weight = 0;

			const normalizedDistance = distance / influence;
			if (normalizedDistance < 1) {
				// Ultra-smooth interpolation with very soft, rounded falloff
				// Using exponential decay with gaussian-like smoothing for maximum softness
				// holy shit this sint working
				const smoothness = 1 - normalizedDistance;
				weight = Math.pow(smoothness, 6) * Math.exp(-normalizedDistance * 3) * Math.exp(-Math.pow(normalizedDistance * 2, 2));
			}

			totalWeight += weight;
			r += blob.color[0] * weight;
			g += blob.color[1] * weight;
			b += blob.color[2] * weight;
		});

		if (totalWeight > 0) {
			return [Math.round(r / totalWeight), Math.round(g / totalWeight), Math.round(b / totalWeight)];
		}

		// Background color
		return [240, 240, 245];
	}, []);

	const render = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { width, height } = canvas;
		const imageData = ctx.createImageData(width, height);
		const data = imageData.data;

		// Sample every 2nd pixel for performance, then scale up
		const scale = 2;

		for (let y = 0; y < height; y += scale) {
			for (let x = 0; x < width; x += scale) {
				const [r, g, b] = getColorAtPixel(x, y);

				// Fill the scaled block
				for (let dy = 0; dy < scale && y + dy < height; dy++) {
					for (let dx = 0; dx < scale && x + dx < width; dx++) {
						const index = ((y + dy) * width + (x + dx)) * 4;
						data[index] = r;
						data[index + 1] = g;
						data[index + 2] = b;
						data[index + 3] = 255;
					}
				}
			}
		}

		ctx.putImageData(imageData, 0, 0);
	}, [getColorAtPixel]);

	const animate = useCallback(() => {
		updateBlobs();
		render();
		animationRef.current = requestAnimationFrame(animate);
	}, [updateBlobs, render]);

	const generateNewPalette = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		generateBlobs(canvas.width, canvas.height);
	};

	const goToHome = () => {
		window.location.href = '/';
	};

	useEffect(() => {
		const initializeCanvas = async () => {
			setIsLoading(true);

			// Small delay to ensure DOM is ready
			await new Promise(resolve => setTimeout(resolve, 100));

			resizeCanvas();

			// Start animation
			animationRef.current = requestAnimationFrame(animate);

			setIsLoading(false);
		};

		initializeCanvas();

		window.addEventListener('resize', resizeCanvas);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			window.removeEventListener('resize', resizeCanvas);
		};
	}, [resizeCanvas, animate]);

	// Update blobs when numBlobs changes
	useEffect(() => {
		if (!isLoading) {
			generateNewPalette();
		}
	}, [numBlobs]);

	return (
		<div ref={containerRef} className="relative h-full w-full bg-gray-50">
			{isLoading && (
				<div className="bg-opacity-90 absolute inset-0 z-10 flex items-center justify-center bg-white">
					<div className="text-center">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
						<p className="text-lg font-medium text-gray-700">Generating color palette...</p>
						<p className="text-sm text-gray-500">Creating beautiful color blobs</p>
					</div>
				</div>
			)}

			<canvas ref={canvasRef} className="h-full w-full" style={{ display: isLoading ? 'none' : 'block' }} />

			{/* Back to Home Button */}
			<div className="absolute top-4 left-4 z-20">
				<button
					onClick={goToHome}
					className="flex items-center gap-2 rounded-lg bg-white bg-opacity-90 px-4 py-2 font-medium text-gray-700 shadow-lg transition-all duration-200 hover:bg-opacity-100 hover:shadow-xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to Home
				</button>
			</div>

			{/* <div className="absolute top-4 left-4 z-20 space-y-2">
				<div className="bg-opacity-90 rounded-lg bg-white p-3 shadow-lg">
					<label className="mb-2 block text-sm font-medium text-gray-700">Number of Colors: {numBlobs.current}</label>
					<input
						type="range"
						min="2"
						max="8"
						value={numBlobs.current}
						onChange={e => (numBlobs.current = parseInt(e.target.value))}
						className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
					/>
				</div>

				<button
					onClick={generateNewPalette}
					className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-lg transition-colors duration-200 hover:bg-blue-600">
					New Palette
				</button>
			</div> */}
		</div>
	);
}