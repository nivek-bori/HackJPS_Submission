'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Color } from '@/app/types';
import axios from 'axios';

interface PaletteProps {
	color: { id: string; colors: string[] };
	loadPalette: (colors: string[]) => void;
}

export function PaletteCard({ color, loadPalette }: PaletteProps) {
	const [status, setStatus] = useState<string | null>(null);
	const [statusType, setStatusType] = useState<'loading' | 'success' | 'error' | null>(null);
	const [hoveredColor, setHoveredColor] = useState<string | null>(null);
	const [copiedColor, setCopiedColor] = useState<string | null>(null);
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Check for dark mode on component mount and listen for changes
	useEffect(() => {
		const checkDarkMode = () => {
			const darkModePreference = localStorage.getItem('blob-palette-dark-mode');
			setIsDarkMode(darkModePreference === 'true');
		};

		checkDarkMode();

		// Listen for storage changes to update dark mode state
		const handleStorageChange = () => {
			checkDarkMode();
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	function deletePalette(id: string) {
		setStatus('Deleting palette...');
		setStatusType('loading');

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000 * 60);

		axios
			.delete(`http://localhost:3000/api/colors/${id}`, { signal: controller.signal })
			.then(res => {
				if (res.data.success) {
					setStatus('Palette deleted successfully!');
					setStatusType('success');
					loadPalette([]);
					// Clear status after 3 seconds
					setTimeout(() => {
						setStatus(null);
						setStatusType(null);
					}, 3000);
				} else {
					setStatus('Failed to delete palette');
					setStatusType('error');
					setTimeout(() => {
						setStatus(null);
						setStatusType(null);
					}, 5000);
				}
			})
			.catch(err => {
				setStatus('Connection error occurred');
				setStatusType('error');
				setTimeout(() => {
					setStatus(null);
					setStatusType(null);
				}, 5000);
			});
	}

	function handleLoadColor() {
		setStatus('Palette loaded!');
		setStatusType('success');
		loadPalette(color.colors);
		// Clear status after 2 seconds
		setTimeout(() => {
			setStatus(null);
			setStatusType(null);
		}, 2000);
	}

	function handleDeletePalette() {
		deletePalette(color.id);
	}

	// Copy hex code to clipboard
	async function copyToClipboard(hex: string) {
		try {
			await navigator.clipboard.writeText(hex);
			setCopiedColor(hex);
			setStatus(`Copied ${hex}!`);
			setStatusType('success');

			// Clear copied state and status after 2 seconds
			setTimeout(() => {
				setCopiedColor(null);
				setStatus(null);
				setStatusType(null);
			}, 2000);
		} catch (err) {
			setStatus('Failed to copy color');
			setStatusType('error');
			setTimeout(() => {
				setStatus(null);
				setStatusType(null);
			}, 3000);
		}
	}

	// Helper function to get border radius class for each color
	function getBorderRadius(index: number, total: number) {
		if (total === 1) {
			return 'rounded-lg';
		} else if (index === 0) {
			return 'rounded-l-lg';
		} else if (index === total - 1) {
			return 'rounded-r-lg';
		}
		return '';
	}

	// Get status icon based on type
	function getStatusIcon() {
		switch (statusType) {
			case 'loading':
				return <Loader2 size={16} className="animate-spin" />;
			case 'success':
				return <CheckCircle size={16} />;
			case 'error':
				return <AlertCircle size={16} />;
			default:
				return null;
		}
	}

	// Get status styling based on type with dark mode support
	function getStatusStyling() {
		const baseClasses = isDarkMode ? 'border-opacity-50' : 'border-opacity-100';

		switch (statusType) {
			case 'loading':
				return `${isDarkMode ? 'bg-blue-900 bg-opacity-50 text-blue-300 border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200'} ${baseClasses}`;
			case 'success':
				return `${isDarkMode ? 'bg-green-900 bg-opacity-50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} ${baseClasses}`;
			case 'error':
				return `${isDarkMode ? 'bg-red-900 bg-opacity-50 text-red-300 border-red-600' : 'bg-red-50 text-red-700 border-red-200'} ${baseClasses}`;
			default:
				return `${isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-600 border-gray-200'} ${baseClasses}`;
		}
	}

	// Get button styling with dark mode support
	function getButtonStyling() {
		return isDarkMode
			? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
			: 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900';
	}

	// Get hover overlay styling with dark mode support
	function getHoverOverlayStyling() {
		return isDarkMode ? 'bg-gray-900 bg-opacity-85 border-gray-400 border border-opacity-20' : 'bg-black bg-opacity-75';
	}

	// Get copy confirmation styling with dark mode support
	function getCopyConfirmationStyling() {
		return isDarkMode ? 'text-green-300 bg-gray-800 bg-opacity-95 border-green-500' : 'text-green-800 bg-green-100 bg-opacity-95 border-green-300';
	}

	return (
		<div className="w-full space-y-3">
			<div className="flex h-20 min-w-max">
				<div className="mr-2 flex h-20 max-w-8 min-w-8 flex-col justify-evenly gap-1 py-2">
					<button
						onClick={handleLoadColor}
						className={`flex flex-1 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-green-500 hover:text-white hover:shadow-md ${getButtonStyling()}`}
						disabled={statusType === 'loading'}>
						<Download size={14} />
					</button>
					<button
						onClick={handleDeletePalette}
						className={`flex flex-1 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-red-500 hover:text-white hover:shadow-md ${getButtonStyling()}`}
						disabled={statusType === 'loading'}>
						<Trash2 size={14} />
					</button>
				</div>
				<div className={`relative flex h-20 flex-1 shadow-sm ${isDarkMode ? 'shadow-gray-800' : ''}`}>
					{color.colors.map((hex, index) => (
						<div
							key={index}
							className={`group relative h-20 flex-1 cursor-pointer transition-all duration-200 hover:z-10 hover:scale-105 hover:shadow-lg ${getBorderRadius(index, color.colors.length)} ${isDarkMode ? 'hover:shadow-gray-900' : ''}`}
							style={{ backgroundColor: hex }}
							onMouseEnter={() => setHoveredColor(hex)}
							onMouseLeave={() => setHoveredColor(null)}
							onClick={() => copyToClipboard(hex)}>
							{/* Hover overlay with hex code */}
							{/* {hoveredColor === hex && (
								<div className="absolute inset-0 flex items-center justify-center transition-all duration-200" style={{ borderRadius: 'inherit' }}>
									<span className={`rounded-full px-3 py-1 font-mono text-sm font-medium text-white shadow-lg ${getHoverOverlayStyling()}`}>
										{hex}
									</span>
								</div>
							)} */}
						</div>
					))}
				</div>
			</div>

			{/* Stylized Status Display */}
			{status && (
				<div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ${getStatusStyling()}`}>
					{getStatusIcon()}
					<span className="flex-1">{status}</span>
					{statusType !== 'loading' && <div className="h-2 w-2 animate-pulse rounded-full bg-current opacity-60"></div>}
				</div>
			)}
		</div>
	);
}
