import React, { useState, useEffect } from 'react';
import { SERVICE_CATEGORIES } from '../types/service';
import { getService, updateService } from '../api/serviceApi';
import { validateService } from '../utils/validation';
import { getToken } from '../utils/token';
import FormInput from '../components/form/FormInput';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateServicePage = () => {
    const [serviceId, setServiceId] = useState('');
    const [isIdSubmitted, setIsIdSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [service, setService] = useState({
        title: '',
        description: '',
        duration: [''],
        price: '',
        image: '',
        details: [''],
        category: SERVICE_CATEGORIES[0]
    });

    const handleServiceChange = (field, value) => {
        if (field === 'image' && value instanceof FileList) {
            const file = value[0];
            if (file && file.type.startsWith('image/')) {
                setService(prev => ({
                    ...prev,
                    [field]: file,
                    imagePreview: URL.createObjectURL(file)
                }));
            }
        } else {
            setService(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleArrayChange = (field, arrIndex, value) => {
        setService(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === arrIndex ? value : item)
        }));
    };

    const handleAddArrayItem = (field) => {
        setService(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveArrayItem = (field, arrIndex) => {
        setService(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== arrIndex)
        }));
    };

    const handleSubmitId = async (e) => {
        e.preventDefault();
        if (serviceId.trim()) {
            setIsLoading(true);
            try {
                const token = getToken();
                const serviceData = await getService(serviceId, token);
                setService(serviceData);
                setIsIdSubmitted(true);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch service');
                setError(error.response?.data?.message || 'Failed to fetch service');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const token = getToken();
        if (!token) {
            toast.error('Authentication required. Please login.');
            setIsLoading(false);
            return;
        }

        try {
            validateService(service);
            await updateService(serviceId, service, token);
            toast.success('Service updated successfully!');
            setIsIdSubmitted(false);
            setServiceId('');

        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            setError(error.response?.data?.message || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (service.imagePreview) {
                URL.revokeObjectURL(service.imagePreview);
            }
        };
    }, [service.imagePreview]);

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
        <>
            {!getToken() ? (
                <div className="w-full min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center flex-col">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">Authentication Required</h2>
                    <p className="text-gray-600">Please login to access this page.</p>
                </div>
            ) : (
                <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
                    <ToastContainer 
                        position="top-right" 
                        autoClose={3000} 
                        hideProgressBar={false}
                        closeOnClick
                        pauseOnHover
                    />
                    {!isIdSubmitted ? (
                        <form onSubmit={handleSubmitId} className="max-w-md mx-auto space-y-4">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Enter Service ID</h2>
                            <FormInput
                                label="Service ID"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                required
                                placeholder="Enter the Service ID"
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Load Service
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitUpdate} className="max-w-4xl mx-auto space-y-6">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Update Service: {serviceId}</h2>
                            <div className="p-3 md:p-4 border rounded-lg space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Title"
                                        value={service.title}
                                        onChange={(e) => handleServiceChange('title', e.target.value)}
                                        required
                                        placeholder="e.g. Swedish Massage"
                                    />
                                    <FormInput
                                        label="Price"
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => handleServiceChange('price', e.target.value)}
                                        required
                                        placeholder="e.g. 1000"
                                    />
                                </div>

                                <FormInput
                                    label="Description"
                                    value={service.description}
                                    onChange={(e) => handleServiceChange('description', e.target.value)}
                                    required
                                    placeholder="e.g. A relaxing full-body massage"
                                />

                                {/* Duration section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Duration Options</label>
                                    <div className="grid gap-2">
                                        {service.duration.map((dur, durIndex) => (
                                            <div key={durIndex} className="flex flex-wrap gap-2">
                                                <div className="flex-grow">
                                                    <FormInput
                                                        value={dur}
                                                        onChange={(e) => handleArrayChange('duration', durIndex, e.target.value)}
                                                        placeholder="e.g. 60 mins"
                                                        required
                                                    />
                                                </div>
                                                {service.duration.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveArrayItem('duration', durIndex)}
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
                                        onClick={() => handleAddArrayItem('duration')}
                                        className="text-blue-500 text-sm"
                                    >
                                        Add Duration Option
                                    </button>
                                </div>

                                {/* Image section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Service Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleServiceChange('image', e.target.files)}
                                        className="w-full p-2 border rounded-md text-sm"
                                    />
                                    {service.imagePreview && (
                                        <img
                                            src={service.imagePreview}
                                            alt="Preview"
                                            className="mt-2 max-w-[150px] md:max-w-[200px] rounded-md"
                                        />
                                    )}
                                </div>

                                {/* Details section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Details</label>
                                    <div className="grid gap-2">
                                        {service.details.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="flex flex-wrap gap-2">
                                                <div className="flex-grow">
                                                    <FormInput
                                                        value={detail}
                                                        onChange={(e) => handleArrayChange('details', detailIndex, e.target.value)}
                                                        placeholder="Add service detail"
                                                        required
                                                    />
                                                </div>
                                                {service.details.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveArrayItem('details', detailIndex)}
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
                                        onClick={() => handleAddArrayItem('details')}
                                        className="text-blue-500 text-sm"
                                    >
                                        Add Detail
                                    </button>
                                </div>

                                {/* Category section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Category</label>
                                    <select
                                        value={service.category}
                                        onChange={(e) => handleServiceChange('category', e.target.value)}
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
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-sm md:text-base transition-colors"
                            >
                                Update Service
                            </button>
                        </form>
                    )}
                    {isLoading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-center mt-4">Processing...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default UpdateServicePage;
