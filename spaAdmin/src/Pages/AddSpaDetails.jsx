import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL

const AddSpaDetails = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        logo: '',
        thumbnail: '',
        instagram: '',
        facebook: '',
        twitter: '',
        youtube: '',
        location: '',
        description: '',
        phone: '',
        email: '',
        footersPrivacy: '',
        quickLinks: '',
        popularLocations: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleArrayChange = (e, fieldName) => {
        const { value } = e.target;
        const arrayValues = value.split(',').map(val => val.trim()); // Split by commas
        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: arrayValues,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/spaDetails`, formData);

            if (response.status === 200) {
                toast.success("Spa details added successfully!");
                setFormData({
                    logo: '',
                    thumbnail: '',
                    instagram: '',
                    facebook: '',
                    twitter: '',
                    youtube: '',
                    location: '',
                    description: '',
                    phone: '',
                    email: '',
                    footersPrivacy: '',
                    quickLinks: '',
                    popularLocations: ''
                });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding spa details");
        }
    };

    return (
        <div className="container mx-auto mt-8">
            <Toaster position="top-right" />
            <h2 className="text-2xl font-bold mb-4">Add New Spa Details</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-gray-700">Logo URL</label>
                    <input
                        type="text"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        placeholder="Enter logo URL"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Thumbnail URLs (comma separated)</label>
                    <input
                        type="text"
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={(e) => handleArrayChange(e, 'thumbnail')}
                        placeholder="Enter thumbnail URLs separated by commas"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Instagram URL</label>
                    <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="Enter Instagram profile URL"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Facebook URL</label>
                    <input
                        type="text"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        placeholder="Enter Facebook page URL"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter spa description"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Footers Privacy Text</label>
                    <input
                        type="text"
                        name="footersPrivacy"
                        value={formData.footersPrivacy}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Quick Links (comma separated)</label>
                    <input
                        type="text"
                        name="quickLinks"
                        value={formData.quickLinks}
                        onChange={(e) => handleArrayChange(e, 'quickLinks')}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Popular Locations (comma separated)</label>
                    <input
                        type="text"
                        name="popularLocations"
                        value={formData.popularLocations}
                        onChange={(e) => handleArrayChange(e, 'popularLocations')}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Add Spa
                </button>
            </form>
        </div>
    );
};

export default AddSpaDetails;
