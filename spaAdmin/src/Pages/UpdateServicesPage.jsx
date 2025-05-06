import React, { useState, useEffect } from 'react';
import { SERVICE_CATEGORIES } from '../types/service';
import { validateService } from '../utils/validation';
import { getToken } from '../utils/token';
import FormInput from '../components/form/FormInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://spabackend-x1sr.onrender.com/api/v1";


const UpdateServicesPage = () => {
    const navigate = useNavigate();
    const [spaId, setSpaId] = useState('');
    const [isIdSubmitted, setIsIdSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const token = getToken();

    const [services, setServices] = useState([{
        title: '',
        description: '',
        duration: [''],
        price: '',
        image: '',
        details: [''],
        category: SERVICE_CATEGORIES[0]
    }]);

    const [existingServices, setExistingServices] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        duration: [''],
        price: '',
        image: '',
        details: [''],
        category: SERVICE_CATEGORIES[0]
    });

    useEffect(() => {
        if (isIdSubmitted && spaId) {
            fetchServices();
        }
    }, [isIdSubmitted, spaId]);

    const checkAndHandleAuth = () => {
        const currentToken = getToken();
        if (!currentToken) {
            toast.error('Please login to continue');
            navigate('/login');
            return false;
        }
        return currentToken;
    };

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const token = checkAndHandleAuth();
            if (!token) return;

            const response = await axios.get(`${API_URL}/spas/${spaId}/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Check if response.data has a data property
            const services = response.data?.data || response.data || [];
            setExistingServices(services);

            if (services.length === 0) {
                toast.info('No services found for this spa');
            }
        } catch (error) {
            console.error('Fetch services error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch services');
            }
            setExistingServices([]);
        }
        setIsLoading(false);
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...services];
        if (field === 'image' && value instanceof FileList) {
            const file = value[0];
            if (file && file.type.startsWith('image/')) {
                newServices[index][field] = file;
                newServices[index].imagePreview = URL.createObjectURL(file);
            }
        } else {
            newServices[index][field] = value;
        }
        setServices(newServices);
    };

    const handleArrayChange = (index, field, arrIndex, value) => {
        const newServices = [...services];
        newServices[index][field][arrIndex] = value;
        setServices(newServices);
    };

    const handleAddArrayItem = (index, field) => {
        const newServices = [...services];
        newServices[index][field] = [...newServices[index][field], ''];
        setServices(newServices);
    };

    const handleRemoveArrayItem = (index, field, arrIndex) => {
        const newServices = [...services];
        newServices[index][field] = newServices[index][field].filter((_, i) => i !== arrIndex);
        setServices(newServices);
    };

    const handleSubmitId = (e) => {
        e.preventDefault();
        if (spaId.trim()) {
            setIsIdSubmitted(true);
        }
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setEditForm({
            ...service,
            image: '', // Clear image since we can't populate File object
        });
    };

    const handleCancelEdit = () => {
        setSelectedService(null);
        setEditForm({
            title: '',
            description: '',
            duration: [''],
            price: '',
            image: '',
            details: [''],
            category: SERVICE_CATEGORIES[0]
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = checkAndHandleAuth();
            if (!token) return;

            validateService(editForm, 0);

            const formData = new FormData();
            Object.keys(editForm).forEach(key => {
                if (key === 'image' && editForm.image) {
                    formData.append('image', editForm.image);
                } else if (Array.isArray(editForm[key])) {
                    editForm[key].forEach((item) => {
                        formData.append(key, item);
                    });
                } else {
                    formData.append(key, editForm[key]);
                }
            });

            await axios.put(
                `${API_URL}/spas/${spaId}/services/${selectedService._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            toast.success('Service updated successfully!');
            handleCancelEdit();
            fetchServices();
        } catch (error) {
            toast.error(error.message || 'Failed to update service');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm('Are you sure you want to delete this service?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = checkAndHandleAuth();
            if (!token) return;

            await axios.delete(
                `${API_URL}/spas/${spaId}/services/${serviceId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Service deleted successfully!');
            fetchServices();
        } catch (error) {
            console.error('Delete service error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete service');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup preview URLs when component unmounts
            services.forEach(service => {
                if (service.imagePreview) {
                    URL.revokeObjectURL(service.imagePreview);
                }
            });
        };
    }, [services]);

    if (error) {
        return (
            <div className="max-w-[70rem] mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <button
                        onClick={() => setError('')}
                        className="underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
            <ToastContainer position="top-right" autoClose={3000} />

            {!isIdSubmitted ? (
                <form onSubmit={handleSubmitId} className="max-w-md mx-auto space-y-4">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Enter Spa ID</h2>
                    <FormInput
                        label="Spa ID"
                        value={spaId}
                        onChange={(e) => setSpaId(e.target.value)}
                        required
                        placeholder="Enter the Spa ID"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Continue
                    </button>
                </form>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">Manage Services for Spa ID: {spaId}</h2>

                    {selectedService ? (
                        <form onSubmit={handleUpdateSubmit} className="space-y-6 mb-8">
                            <div className="p-4 border rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Title"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        required
                                    />
                                    <FormInput
                                        label="Price"
                                        type="number"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <FormInput
                                    label="Description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    required
                                />

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Duration Options</label>
                                    <div className="grid gap-2">
                                        {editForm.duration.map((dur, durIndex) => (
                                            <div key={durIndex} className="flex flex-wrap gap-2">
                                                <div className="flex-grow">
                                                    <FormInput
                                                        value={dur}
                                                        onChange={(e) => {
                                                            const newDuration = [...editForm.duration];
                                                            newDuration[durIndex] = e.target.value;
                                                            setEditForm({ ...editForm, duration: newDuration });
                                                        }}
                                                        placeholder="e.g. 60 mins"
                                                        required
                                                    />
                                                </div>
                                                {editForm.duration.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newDuration = editForm.duration.filter((_, i) => i !== durIndex);
                                                            setEditForm({ ...editForm, duration: newDuration });
                                                        }}
                                                        className="text-red-500 px-2"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({
                                            ...editForm,
                                            duration: [...editForm.duration, '']
                                        })}
                                        className="text-blue-500 text-sm"
                                    >
                                        Add Duration Option
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Service Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file && file.type.startsWith('image/')) {
                                                setEditForm({
                                                    ...editForm,
                                                    image: file,
                                                    imagePreview: URL.createObjectURL(file)
                                                });
                                            }
                                        }}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                    {(editForm.imagePreview || editForm.image) && (
                                        <img
                                            src={editForm.imagePreview || editForm.image}
                                            alt="Preview"
                                            className="mt-2 max-w-[150px] md:max-w-[200px] rounded-md"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Details</label>
                                    <div className="grid gap-2">
                                        {editForm.details.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="flex flex-wrap gap-2">
                                                <div className="flex-grow">
                                                    <FormInput
                                                        value={detail}
                                                        onChange={(e) => {
                                                            const newDetails = [...editForm.details];
                                                            newDetails[detailIndex] = e.target.value;
                                                            setEditForm({ ...editForm, details: newDetails });
                                                        }}
                                                        placeholder="Add service detail"
                                                        required
                                                    />
                                                </div>
                                                {editForm.details.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newDetails = editForm.details.filter((_, i) => i !== detailIndex);
                                                            setEditForm({ ...editForm, details: newDetails });
                                                        }}
                                                        className="text-red-500 px-2"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({
                                            ...editForm,
                                            details: [...editForm.details, '']
                                        })}
                                        className="text-blue-500 text-sm"
                                    >
                                        Add Detail
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Category</label>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full p-2 border rounded-md text-sm"
                                        required
                                    >
                                        {SERVICE_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {existingServices.map((service) => (
                                <div key={service._id} className="border p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{service.title}</h4>
                                        <p className="text-sm text-gray-600">{service.category}</p>
                                        <p className="text-sm">Price: ₹{service.price}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditService(service)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="text-center">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateServicesPage;
