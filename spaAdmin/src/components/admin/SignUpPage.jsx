import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';


const API_URL = import.meta.env.VITE_API_URL;


const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'user'  // default role
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Phone validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (validateForm()) {
            try {
                const response = await axios.post(`${API_URL}/auth/register`, {
                    username: formData.username,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    role: formData.role
                });

                if (response.data.status === 'success') {
                    toast.success('Registration successful!');
                    // Store token if needed
                    // localStorage.setItem('token', response.data.token);
                    navigate('/login');
                }
            } catch (error) {
                const message = error.response?.data?.message || 'Registration failed';
                toast.error(message);
                setServerError(message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <ToastContainer position="top-right" />
            <div className="bg-white shadow-md rounded-lg max-w-md w-full p-8 space-y-6">
                <h2 className="text-center text-3xl font-bold text-gray-800">Create an Account</h2>
                {serverError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {serverError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                            ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
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

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                        > 
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account? {' '}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;