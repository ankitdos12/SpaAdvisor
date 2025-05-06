import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        loginId: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const { loginId, password } = formData;

        if (!loginId.trim()) {
            newErrors.loginId = 'Email or Phone number is required';
        } else {
            const isEmail = loginId.includes('@');
            if (isEmail && !emailRegex.test(loginId)) {
                newErrors.loginId = 'Invalid email format';
            } else if (!isEmail && !phoneRegex.test(loginId)) {
                newErrors.loginId = 'Phone number must be 10 digits';
            }
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const loginData = {
                loginId: formData.loginId.trim(),
                password: formData.password
            };

            const response = await axios.post(
                `${API_URL}/auth/login`,
                loginData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { token, data } = response.data;

            // Validate user role
            if (!['admin', 'superadmin'].includes(data.user.role)) {
                throw new Error('Unauthorized access. Admin privileges required.');
            }

            localStorage.setItem('adminToken', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');

        } catch (error) {
            const errorMessage = error.response?.data?.message
                || error.message
                || 'Login failed. Please try again.';

            setErrors(prev => ({
                ...prev,
                submit: errorMessage
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 space-y-6">
                <h2 className="text-center text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-center text-gray-600 mb-6">Log in to your account</p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-1">
                            Email or Phone Number
                        </label>
                        <input
                            type="text"
                            id="loginId"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.loginId ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter email or phone number"
                        />
                        {errors.loginId && (
                            <p className="text-red-500 text-xs mt-1">{errors.loginId}</p>
                        )}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-8 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {errors.submit && (
                        <p className="text-red-500 text-sm text-center">{errors.submit}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full ${isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} 
                            text-white py-2 rounded-md transition duration-300 ease-in-out 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </form>

                {/* <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account? {' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default LoginPage;


