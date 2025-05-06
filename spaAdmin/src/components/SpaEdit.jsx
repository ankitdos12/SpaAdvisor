import React, { useEffect, useState } from 'react';
import FormInput from './form/FormInput';
import LocationFields from './form/LocationFields';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const SpaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newType, setNewType] = useState('');
    const [spa, setSpa] = useState({
        name: '',
        location: {
            country: 'India',
            state: '',
            district: '',
            locality: '',
            pincode: '',
            address: ''
        },
        type: [],
        startingPrice: 0,
        discount: 0,
        rating: 0,
        reviewCount: 0,
        coordinates: { lat: '', lng: '' },
        contacts: {
            number: '',
            email: '',
            website: ''
        },
        openingHours: {
            days: 'Monday to Sunday',
            time: '10:00 AM to 10:00 PM'
        },
        mapLink: '',
        images: []
    });

    useEffect(() => {
        const fetchSpaDetails = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get(`${API_URL}/spas/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const spaData = response.data.data;
                console.log('Fetched spa data:', spaData);

                setSpa(prevSpa => ({
                    ...prevSpa,
                    ...spaData,
                    name: spaData.name || '',
                    location: { ...prevSpa.location, ...spaData.location },
                    contacts: { ...prevSpa.contacts, ...spaData.contacts },
                    coordinates: { ...prevSpa.coordinates, ...spaData.coordinates },
                    openingHours: { ...prevSpa.openingHours, ...spaData.openingHours },
                    type: spaData.type || []
                }));
                
                setExistingImages(spaData.images || []);
                setIsLoading(false);
                toast.success('Spa details loaded successfully');
            } catch (error) {
                console.error('Error fetching spa:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch spa details');
                navigate('/spas');
            }
        };

        fetchSpaDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            setSpa(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name.startsWith('contacts.')) {
            setSpa(prev => ({
                ...prev,
                contacts: {
                    ...prev.contacts,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name.startsWith('coordinates.')) {
            setSpa(prev => ({
                ...prev,
                coordinates: {
                    ...prev.coordinates,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name.startsWith('openingHours.')) {
            setSpa(prev => ({
                ...prev,
                openingHours: {
                    ...prev.openingHours,
                    [name.split('.')[1]]: value
                }
            }));
        } else if (name === 'type') {
            setNewType(value);
        } else {
            setSpa(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.warning('Images must be less than 5MB each. Some images were not added.');
            return;
        }

        setImageFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        toast.success(`${newFiles.length} image(s) added successfully`);
    };

    const removeImage = (index, isExisting = false) => {
        if (isExisting) {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
            toast.info('Existing image removed');
        } else {
            setImageFiles(prev => prev.filter((_, i) => i !== index));
            URL.revokeObjectURL(imagePreviews[index]);
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
            toast.info('New image removed');
        }
    };

    const handleAddType = () => {
        if (newType.trim()) {
            setSpa(prev => ({
                ...prev,
                type: [...prev.type, newType.trim()]
            }));
            setNewType('');
            toast.success('Spa type added');
        } else {
            toast.error('Please enter a valid spa type');
        }
    };

    const handleRemoveType = (indexToRemove) => {
        setSpa(prev => ({
            ...prev,
            type: prev.type.filter((_, index) => index !== indexToRemove)
        }));
        toast.info('Spa type removed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        toast.info('Updating spa details...');

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            // Create the request body with flattened location fields
            const requestBody = {
                name: spa.name,
                country: spa.location.country,
                state: spa.location.state,
                district: spa.location.district,
                locality: spa.location.locality,
                pincode: spa.location.pincode,
                address: spa.location.address,
                contacts: spa.contacts,
                coordinates: spa.coordinates,
                openingHours: spa.openingHours,
                type: spa.type,
                startingPrice: spa.startingPrice,
                discount: spa.discount,
                rating: spa.rating,
                reviewCount: spa.reviewCount,
                mapLink: spa.mapLink
            };

            // First update the spa data
            const response = await axios.put(
                `${API_URL}/spas/${id}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // If there are new images, upload them using FormData
            if (imageFiles.length > 0) {
                toast.info('Uploading images...');
                const formData = new FormData();
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });

                await axios.put(
                    `${API_URL}/spas/${id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            }

            toast.success('Spa updated successfully!');
            navigate('/');
        } catch (error) {
            console.error('Update error:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to update spa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragStart = (e, index, isExisting) => {
        e.dataTransfer.setData('index', index);
        e.dataTransfer.setData('isExisting', isExisting);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, dropIndex, isExistingTarget) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('index'));
        const isExistingSource = e.dataTransfer.getData('isExisting') === 'true';

        if (isExistingSource === isExistingTarget) {
            // Reordering within the same array
            if (isExistingSource) {
                const newExistingImages = [...existingImages];
                const [movedItem] = newExistingImages.splice(dragIndex, 1);
                newExistingImages.splice(dropIndex, 0, movedItem);
                setExistingImages(newExistingImages);
            } else {
                const newImageFiles = [...imageFiles];
                const newImagePreviews = [...imagePreviews];
                const [movedFile] = newImageFiles.splice(dragIndex, 1);
                const [movedPreview] = newImagePreviews.splice(dragIndex, 1);
                newImageFiles.splice(dropIndex, 0, movedFile);
                newImagePreviews.splice(dropIndex, 0, movedPreview);
                setImageFiles(newImageFiles);
                setImagePreviews(newImagePreviews);
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!spa) {
        return <div className="text-center py-8">Spa not found</div>;
    }

    return (
        <div className="w-full max-w-[70rem] mx-auto p-3 sm:p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Edit Spa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <FormInput label="Spa Name" name="name" value={spa.name || ''} onChange={handleChange} required />
                    <LocationFields location={spa.location} onChange={handleChange} />
                    <div className="space-y-2">
                        <label className="block font-medium text-sm text-gray-700">Spa Types</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="type"
                                value={newType}
                                onChange={handleChange}
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Enter spa type"
                            />
                            <button
                                type="button"
                                onClick={handleAddType}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {spa.type.map((type, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                                >
                                    {type}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveType(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                        label="Starting Price"
                        type="number"
                        name="startingPrice"
                        value={spa.startingPrice || 0}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                    <FormInput
                        label="Discount (%)"
                        type="number"
                        name="discount"
                        value={spa.discount || 0}
                        onChange={handleChange}
                        min="0"
                        max="100"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                        label="Rating"
                        type="number"
                        name="rating"
                        value={spa.rating || 0}
                        onChange={handleChange}
                        min="0"
                        max="5"
                        step="0.1"
                    />
                    <FormInput
                        label="Review Count"
                        type="number"
                        name="reviewCount"
                        value={spa.reviewCount || 0}
                        onChange={handleChange}
                        min="0"
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Phone Number"
                            name="contacts.number"
                            value={spa.contacts?.number || ''}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Email"
                            name="contacts.email"
                            value={spa.contacts?.email || ''}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Website"
                            name="contacts.website"
                            value={spa.contacts?.website || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Opening Hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Working Days"
                            name="openingHours.days"
                            value={spa.openingHours?.days || ''}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Timings"
                            name="openingHours.time"
                            value={spa.openingHours?.time || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Location Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Latitude"
                            type="number"
                            name="coordinates.lat"
                            value={spa.coordinates?.lat || ''}
                            onChange={handleChange}
                            step="any"
                        />
                        <FormInput
                            label="Longitude"
                            type="number"
                            name="coordinates.lng"
                            value={spa.coordinates?.lng || ''}
                            onChange={handleChange}
                            step="any"
                        />
                    </div>
                    <FormInput
                        label="Google Maps Link"
                        name="mapLink"
                        value={spa.mapLink || ''}
                        onChange={handleChange}
                        placeholder="Enter Google Maps URL"
                    />
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                            Existing Images (Drag to reorder)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                            {existingImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative group cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index, true)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index, true)}
                                >
                                    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded-br">
                                        {index + 1}
                                    </div>
                                    <img
                                        src={image}
                                        alt={`Existing ${index + 1}`}
                                        className="h-24 sm:h-32 w-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index, true)}
                                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images */}
                <div className="space-y-4">
                    <label className="block font-medium text-sm text-gray-700">
                        Add New Images (Drag to reorder)
                    </label>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full" />
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="relative group cursor-move"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index, false)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index, false)}
                                >
                                    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded-br">
                                        {index + 1}
                                    </div>
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="h-24 sm:h-32 w-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-500 text-white py-2 sm:py-3 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Spa'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/spas')}
                        className="flex-1 bg-gray-500 text-white py-2 sm:py-3 rounded-md hover:bg-gray-600 transition duration-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SpaEdit;
