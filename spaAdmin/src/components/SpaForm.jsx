import React, { useEffect, useState } from 'react';
import FormInput from './form/FormInput';
import LocationFields from './form/LocationFields';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
    name: '',
    location: {
        country: 'India',
        state: 'Maharashtra',
        district: 'Thane',
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
    }
};

const SpaForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [spa, setSpa] = useState(initialState);

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
            setSpa(prev => ({
                ...prev,
                type: value.split(',').map(item => item.trim()).filter(item => item)
            }));
        } else {
            setSpa(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const errors = [];

        if (!spa.name) errors.push('Spa name is required');
        if (!spa.location.locality) errors.push('Locality is required');
        if (!spa.location.pincode) errors.push('Pincode is required');
        if (!spa.location.address) errors.push('Address is required');
        if (!spa.startingPrice) errors.push('Starting price is required');
        if (spa.rating < 0 || spa.rating > 5) errors.push('Rating must be between 0 and 5');
        if (spa.reviewCount < 0) errors.push('Review count cannot be negative');

        if (!spa.contacts.number) errors.push('Phone number is required');
        if (!spa.contacts.email) errors.push('Email is required');
        if (!spa.contacts.website) errors.push('Website is required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (spa.contacts.email && !emailRegex.test(spa.contacts.email)) errors.push('Invalid email format');

        const phoneRegex = /^\d{10}$/;
        if (spa.contacts.number && !phoneRegex.test(spa.contacts.number)) errors.push('Phone number must be 10 digits');

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        return true;
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.error('Some images are too large. Maximum size is 5MB per image.');
            return;
        }

        setImageFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            validateForm();

            const formData = new FormData();

            formData.append('name', spa.name.trim());
            formData.append('country', spa.location.country);
            formData.append('state', spa.location.state);
            formData.append('district', spa.location.district);
            formData.append('locality', spa.location.locality);
            formData.append('pincode', spa.location.pincode);
            formData.append('address', spa.location.address);
            formData.append('type', spa.type.join(', '));
            formData.append('startingPrice', spa.startingPrice);
            formData.append('discount', spa.discount);
            formData.append('rating', spa.rating);
            formData.append('reviewCount', spa.reviewCount);
            formData.append('coordinates[lat]', spa.coordinates.lat);
            formData.append('coordinates[lng]', spa.coordinates.lng);
            formData.append('contacts[number]', spa.contacts.number.trim());
            formData.append('contacts[email]', spa.contacts.email.trim().toLowerCase());
            formData.append('contacts[website]', spa.contacts.website.trim());
            formData.append('openingHours[days]', spa.openingHours.days);
            formData.append('openingHours[time]', spa.openingHours.time);

            imageFiles.forEach(file => {
                formData.append('images', file);
            });

            const response = await axios.post(
                'https://spabackend-x1sr.onrender.com/api/v1/spas',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success('Spa added successfully!', { position: 'top-right', autoClose: 3000 });
                // Reset form
                setSpa(initialState);
                setImageFiles([]);
                setImagePreviews([]);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to save spa.';
            toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[70rem] mx-auto p-3 sm:p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Spa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <FormInput label="Spa Name" name="name" value={spa.name} onChange={handleChange} required placeholder="Enter spa name" />
                    <LocationFields location={spa.location} onChange={handleChange} />
                    <FormInput label="Spa Types (comma-separated)" name="type" value={spa.type.join(', ')} onChange={handleChange} placeholder="e.g. Ayurvedic, Thai, Swedish" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Starting Price" type="number" name="startingPrice" value={spa.startingPrice} onChange={handleChange} min="0" />
                    <FormInput label="Discount (%)" type="number" name="discount" value={spa.discount} onChange={handleChange} min="0" max="100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Rating" type="number" name="rating" value={spa.rating} onChange={handleChange} min="0" max="5" step="0.1" />
                    <FormInput label="Review Count" type="number" name="reviewCount" value={spa.reviewCount} onChange={handleChange} min="0" />
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput label="Phone Number" name="contacts.number" value={spa.contacts.number} onChange={handleChange} />
                        <FormInput label="Email" name="contacts.email" value={spa.contacts.email} onChange={handleChange} />
                        <FormInput label="Website" name="contacts.website" value={spa.contacts.website} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Opening Hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Working Days" name="openingHours.days" value={spa.openingHours.days} onChange={handleChange} />
                        <FormInput label="Timings" name="openingHours.time" value={spa.openingHours.time} onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Coordinates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Latitude" type="number" name="coordinates.lat" value={spa.coordinates.lat || ''} onChange={handleChange} step="any" />
                        <FormInput label="Longitude" type="number" name="coordinates.lng" value={spa.coordinates.lng || ''} onChange={handleChange} step="any" />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block font-medium text-sm text-gray-700">Upload Images ({imageFiles.length} selected)</label>
                    <label className="flex flex-col items-center justify-center w-full h-40 sm:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4 text-gray-500" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
                        </div>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                    </label>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img src={preview} alt={`Preview ${index + 1}`} className="h-24 sm:h-32 w-full object-cover rounded-lg" />
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

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-2 sm:py-3 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        {isSubmitting ? 'Saving Spa...' : 'Add Spa'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SpaForm;
