'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';

export default function Developer() {
	const [userStat, setUserStat] = useState<string | null>(null);
	const [loadingUserStat, setLoadingUserStat] = useState(false);

	const [colorStat, setColorStat] = useState<string | null>(null);
	const [loadingColorStat, setLoadingColorStat] = useState(false);

	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const savedMode = localStorage.getItem('blob-palette-dark-mode');
		setIsDarkMode(savedMode === 'true');
	}, []);

	const toggleDarkMode = () => {
		const newMode = !isDarkMode;
		setIsDarkMode(newMode);
		localStorage.setItem('blob-palette-dark-mode', newMode.toString());
	};

	// USERS
	async function deleteUsers(authUsers: boolean, dbUsers: boolean) {
		setLoadingUserStat(true);
		setUserStat('Deleting users...');

		axios
			.delete('http://localhost:3000/api/developer/users', { data: { auth: authUsers, db: dbUsers } })
			.then(res => {
				if (res.data.success) {
					setUserStat(`Successfully deleted ${res.data.count} users`);
				} else {
					setUserStat('Error: ' + res.data.error);
				}
			})
			.catch(err => {
				setUserStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingUserStat(false);
			});
	}

	// COLORS
	async function createColorPal() {
		setLoadingColorStat(true);
		setColorStat('Creating colors...');

		axios
			.post('http://localhost:3000/api/colors', { colors: ['#445fe0', '#48a5df', '#4789dd', '#4573df', '#45c4dd'] })
			.then(res => {
				if (res.data.success) {
					setColorStat(`Color palette created`);
				} else {
					setColorStat('Error: ' + res.data.error);
				}
			})
			.catch(err => {
				setColorStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingColorStat(false);
			});
	}

	async function getColorPal(id: string | null) {
		setLoadingColorStat(true);
		setColorStat('Getting colors...');

		axios
			.get('http://localhost:3000/api/colors')
			.then(res => {
				if (res.data.success) {
					setColorStat(`Color palette: ` + JSON.stringify(res.data.data));
				} else {
					setColorStat('Error: ' + res.data.error);
				}
			})
			.catch(err => {
				setColorStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingColorStat(false);
			});
	}

	async function deleteColor(id: string) {
		setLoadingColorStat(true);
		setColorStat('Deleting one color...');

		axios
			.delete(`http://localhost:3000/api/colors/${id}`)
			.then(res => {
				if (res.data.success) {
					setColorStat(`Color palette: ` + JSON.stringify(res.data.data));
				} else {
					setColorStat('Error: ' + res.data.error);
				}
			})
			.catch(err => {
				setColorStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingColorStat(false);
			});
	}

	async function deleteColors() {
		setLoadingColorStat(true);
		setColorStat('Deleting colors...');

		axios
			.delete('http://localhost:3000/api/developer/colors')
			.then(res => {
				if (res.data.success) {
					setColorStat(`Successfully deleted ${res.data.count || '0'} colors`);
				} else {
					setColorStat('Error: ' + res.data.error);
				}
			})
			.catch(err => {
				setColorStat('Error: ' + err.message);
			})
			.finally(() => {
				setLoadingColorStat(false);
			});
	}

	// DEVELOPER INTERFACE
	return (
		<div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
			<div className="p-8">
				{/* Header with Dark Mode Toggle */}
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold">Developer Tools</h1>
					<button
						onClick={toggleDarkMode}
						className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
							isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}>
						{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
						{isDarkMode ? 'Light' : 'Dark'}
					</button>
				</div>

				<div className="mb-8 flex flex-col gap-[0.5rem]">
					<h2 className="mb-[0.25rem] text-xl font-semibold">Database Management</h2>

					{/* User db interactions */}
					<div className="flex gap-[0.75rem]">
						<button
							onClick={() => {
								deleteUsers(true, true);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete All users'}
						</button>

						<button
							onClick={() => {
								deleteUsers(true, false);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete Auth users'}
						</button>

						<button
							onClick={() => {
								deleteUsers(false, true);
							}}
							disabled={loadingUserStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingUserStat ? 'Deleting...' : 'Delete DB users'}
						</button>
					</div>

					{/* Color db interactions */}
					<div className="flex gap-[0.75rem]">
						<button
							onClick={() => {
								createColorPal();
							}}
							disabled={loadingColorStat}
							className="w-[12rem] rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400">
							{loadingColorStat ? 'Loading...' : 'Create color palette'}
						</button>

						<button
							onClick={() => {
								getColorPal('97257cb4-9479-4fbd-9ba7-e2d691662880');
							}}
							disabled={loadingColorStat}
							className="w-[12rem] rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-gray-400">
							{loadingColorStat ? 'Loading...' : 'Get color palette'}
						</button>

						<button
							onClick={() => {
								deleteColors();
							}}
							disabled={loadingColorStat}
							className="w-[12rem] rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:bg-gray-400">
							{loadingColorStat ? 'Loading...' : 'Delete all colors'}
						</button>

						<button
							onClick={() => {
								deleteColor('97257cb4-9479-4fbd-9ba7-e2d691662880');
							}}
							disabled={loadingColorStat}
							className="w-[12rem] rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:bg-gray-400">
							{loadingColorStat ? 'Loading...' : 'Delete one color'}
						</button>
					</div>

					{userStat && <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{userStat}</p>}
					{colorStat && <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{colorStat}</p>}
				</div>

				<div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
					<p>Warning: These actions cannot be undone and should only be used in development.</p>
				</div>
			</div>
		</div>
	);
}
