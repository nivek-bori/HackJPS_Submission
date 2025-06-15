'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { stringFromBase64URL } from '@supabase/ssr';

export default function SignUp() {
	const supabase = createClient();
	const router = useRouter();

	// Dark mode state - initialize immediately from localStorage to prevent flash
	const getInitialDarkMode = () => {
		if (typeof window !== 'undefined') {
			const savedMode = localStorage.getItem('blob-palette-dark-mode');
			if (savedMode) {
				return savedMode === 'true';
			}
			// Optional: fallback to system preference
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		return false;
	};

	const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Sync with any changes made on other pages
	useEffect(() => {
		const handleStorageChange = (e: any) => {
			if (e.key === 'blob-palette-dark-mode') {
				setIsDarkMode(e.newValue === 'true');
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	// Simulate sign up function (matching your existing structure)
	async function signUp(email: string, password: string, name: string) {
		setStatus(null);
		setIsLoading(true);

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 1000 * 60); // Timeout logic

		// all logic is handled in .then() and .catch()
		axios
			.post('http://localhost:3000/api/signup', { email: email, password: password, name: name }, { signal: controller.signal })
			.then(res => {
				const body = res.data;

				if (body.success) {
					setStatus({
						success: true,
						message: 'Sign up successful!',
					});
					// if redirectUrl, delay before redirecting to redirectUrl
					if (body.redirectUrl)
						setTimeout(() => {
							router.push(body.redirectUrl);
						}, 500);
				}
				if (!body.success) {
					if (body.error) setStatus({ success: false, message: body.error });
					else
						setStatus({
							success: false,
							message: 'Sign up unsuccessful',
						});
				}
			})
			.catch(err => {
				// this is an axios error - refer to documentation
				if (err.response) {
					console.log('Sign Up API Error: ');
					console.log(err.response);
					setStatus({
						success: false,
						message: err.response.data.error,
					});
				} else {
					console.log('Sign Up API Error: ');
					console.log(err.message);
					setStatus({ success: false, message: err.message });
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	// Email validation function
	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = () => {
		if (!formData.name.trim()) {
			setStatus({
				success: false,
				message: 'Please enter your name',
			});
			return;
		}

		if (!formData.email.trim()) {
			setStatus({
				success: false,
				message: 'Please enter your email',
			});
			return;
		}

		if (!isValidEmail(formData.email)) {
			setStatus({
				success: false,
				message: 'Please enter a valid email address',
			});
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setStatus({
				success: false,
				message: 'Passwords do not match',
			});
			return;
		}

		if (formData.password.length < 6) {
			setStatus({
				success: false,
				message: 'Password must be at least 6 characters',
			});
			return;
		}

		signUp(formData.email, formData.password, formData.name);
	};

	const handleInputChange = e => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		// Clear status when user starts typing
		if (status) setStatus(null);
	};

	const toggleDarkMode = () => {
		const newMode = !isDarkMode;
		setIsDarkMode(newMode);
		localStorage.setItem('blob-palette-dark-mode', newMode.toString());
	};

	// Handle Enter key press
	const handleKeyPress = e => {
		if (e.key === 'Enter' && !isLoading) {
			handleSubmit();
		}
	};

	return (
		<div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
			{/* Back arrow and Dark mode toggle */}
			<div className="absolute top-4 left-4">
				<button
					onClick={() => router.push('/')}
					className={`rounded-full p-3 transition-colors duration-200 ${
						isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 shadow-md hover:bg-gray-100'
					}`}>
					<ArrowLeft size={20} />
				</button>
			</div>

			<div className="absolute top-4 right-4">
				<button
					onClick={toggleDarkMode}
					className={`rounded-full p-3 transition-colors duration-200 ${
						isDarkMode ? 'bg-gray-800 text-purple-400 hover:bg-gray-700' : 'bg-white text-gray-600 shadow-md hover:bg-gray-100'
					}`}>
					{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
				</button>
			</div>

			<div className="flex min-h-screen items-center justify-center px-4">
				<div className={`w-full max-w-md space-y-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-lg`}>
					{/* Header */}
					<div className="text-center">
						<h2 className="text-3xl font-bold">Create Account</h2>
						<p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Join us to get started</p>
					</div>

					{/* Status Messages */}
					{status && (
						<div
							className={`rounded-lg p-4 text-center font-semibold ${
								status.success ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-red-200 bg-red-100 text-red-800'
							}`}>
							{status.message}
						</div>
					)}

					{/* Loading State */}
					{isLoading && (
						<div className="text-center">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
							<p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Creating your account...</p>
						</div>
					)}

					{/* Sign Up Form */}
					{!isLoading && !status?.success && (
						<div className="space-y-6">
							{/* Name Field */}
							<div>
								<label htmlFor="name" className="mb-2 block text-sm font-medium">
									Full Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									value={formData.name}
									onChange={handleInputChange}
									onKeyPress={handleKeyPress}
									className={`w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${
										isDarkMode
											? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
											: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
									}`}
									placeholder="Enter your full name"
								/>
							</div>

							{/* Email Field */}
							<div>
								<label htmlFor="email" className="mb-2 block text-sm font-medium">
									Email Address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleInputChange}
									onKeyPress={handleKeyPress}
									className={`w-full rounded-lg border px-3 py-2 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${
										isDarkMode
											? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
											: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
									}`}
									placeholder="Enter your email"
								/>
							</div>

							{/* Password Field */}
							<div>
								<label htmlFor="password" className="mb-2 block text-sm font-medium">
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? 'text' : 'password'}
										required
										value={formData.password}
										onChange={handleInputChange}
										onKeyPress={handleKeyPress}
										className={`w-full rounded-lg border px-3 py-2 pr-10 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${
											isDarkMode
												? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
												: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
										}`}
										placeholder="Enter your password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
											isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
										}`}>
										{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
									</button>
								</div>
							</div>

							{/* Confirm Password Field */}
							<div>
								<label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
									Confirm Password
								</label>
								<div className="relative">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={formData.confirmPassword}
										onChange={handleInputChange}
										onKeyPress={handleKeyPress}
										className={`w-full rounded-lg border px-3 py-2 pr-10 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none ${
											isDarkMode
												? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
												: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
										}`}
										placeholder="Confirm your password"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
											isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
										}`}>
										{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
									</button>
								</div>
							</div>

							{/* Submit Button */}
							<button
								onClick={handleSubmit}
								disabled={isLoading}
								className="w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none disabled:bg-purple-400">
								Create Account
							</button>
						</div>
					)}

					{/* Sign In Link */}
					{!isLoading && (
						<div className="text-center">
							<p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								Already have an account?{' '}
								<a href="/signin" className="font-medium text-purple-600 hover:text-purple-500">
									Sign in
								</a>
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
