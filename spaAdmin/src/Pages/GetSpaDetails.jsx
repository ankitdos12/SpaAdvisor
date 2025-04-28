import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardContent = () => {
    const [spaDetailsList, setSpaDetailsList] = useState([]); // Initialize as empty array
    const [formData, setFormData] = useState(initialFormData());
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL


    function initialFormData() {
        return {
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
            quickLinks: [],
            popularLocations: []
        };
    }

    useEffect(() => {
        fetchSpaDetails();
    }, []);

    const showToast = (message, type = 'success') => {
        toast[type](message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
        });
    };

    const fetchSpaDetails = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/spaDetails`);
            // Ensure data is an array before setting state
            setSpaDetailsList(Array.isArray(data) ? data : []);
        } catch (error) {
            setSpaDetailsList([]); // Reset to empty array on error
            showToast(error.response?.data?.message || 'Error fetching spa details', 'error');
            console.error('Error fetching spa details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleArrayChange = (e, fieldName) => {
        const { value } = e.target;
        if (fieldName === 'thumbnail') {
            const arrayValues = value.split(',').map(val => val.trim());
            setFormData(prev => ({ ...prev, [fieldName]: arrayValues }));
        } else if (fieldName === 'quickLinks' || fieldName === 'popularLocations') {
            try {
                const items = JSON.parse(value);
                setFormData(prev => ({ ...prev, [fieldName]: items }));
            } catch (error) {
                console.error(`Invalid JSON format for ${fieldName}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing ? `${API_URL}/spaDetails/${editId}` : `${API_URL}/spaDetails`;
            const method = isEditing ? 'put' : 'post';

            await axios[method](url, formData);
            showToast(`Spa details ${isEditing ? 'updated' : 'added'} successfully!`);
            setFormData(initialFormData());
            setIsEditing(false);
            setEditId(null);
            fetchSpaDetails();
        } catch (error) {
            showToast(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} spa details`, 'error');
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (spa) => {
        setFormData({
            ...spa,
            thumbnail: Array.isArray(spa.thumbnail) ? spa.thumbnail.join(', ') : '',
            quickLinks: spa.quickLinks || [],
            popularLocations: spa.popularLocations || []
        });
        setIsEditing(true);
        setEditId(spa._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this spa detail?')) return;

        try {
            await axios.delete(`${API_URL}/spaDetails/${id}`);
            showToast('Spa details deleted successfully!');
            fetchSpaDetails();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error deleting spa details', 'error');
            console.error('Error deleting spa details:', error);
        }
    };

    const getPlaceholder = (field) => {
        const placeholders = {
            logo: 'Enter logo URL',
            thumbnail: 'Enter thumbnail URLs separated by commas',
            instagram: 'Enter Instagram profile URL',
            facebook: 'Enter Facebook profile URL',
            twitter: 'Enter Twitter profile URL',
            youtube: 'Enter YouTube channel URL',
            location: 'Enter spa location',
            description: 'Enter spa description',
            phone: 'Enter contact number',
            email: 'Enter email address',
            footersPrivacy: 'Enter footer privacy text',
            quickLinks: '[{"name": "Home", "url": "/"}, ...]',
            popularLocations: '[{"name": "Mumbai", "url": "/locations/mumbai"}, ...]'
        };
        return placeholders[field] || `Enter ${field}`;
    };

    return (
        <div className="container mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Spa Details' : 'Add New Spa Details'}</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
                {/* Form Fields */}
                {Object.keys(formData).map((field) => (
                    <div className="mb-4" key={field}>
                        <label className="block text-gray-700 capitalize">{field}</label>
                        {field === 'quickLinks' || field === 'popularLocations' ? (
                            <textarea
                                name={field}
                                value={JSON.stringify(formData[field], null, 2)}
                                placeholder={getPlaceholder(field)}
                                onChange={(e) => handleArrayChange(e, field)}
                                className="w-full p-2 border border-gray-300 rounded h-32 font-mono"
                            />
                        ) : (
                            <input
                                type="text"
                                name={field}
                                value={formData[field]}
                                placeholder={getPlaceholder(field)}
                                onChange={(e) =>
                                    field === 'thumbnail' ? handleArrayChange(e, field) : handleChange(e)
                                }
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        )}
                    </div>
                ))}
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    {isEditing ? 'Update Spa' : 'Add Spa'}
                </button>
            </form>

            {/* Spa Details List */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">All Spa Details</h2>
                {spaDetailsList.length === 0 ? (
                    <p>No spa details found.</p>
                ) : (
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2">Logo</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spaDetailsList.map((spa) => (
                                <tr key={spa._id} className="border-t">
                                    <td className="px-4 py-2">{spa.logo ? <img src={spa.logo} alt="logo" className="h-10" /> : 'N/A'}</td>
                                    <td className="px-4 py-2">{spa.location}</td>
                                    <td className="px-4 py-2">{spa.phone}</td>
                                    <td className="px-4 py-2 flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(spa)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(spa._id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DashboardContent;
