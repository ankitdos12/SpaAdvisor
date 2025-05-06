import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateSpa } from '../api/spaApi';

const UpdateSpa = ({ spaToEdit, onSpaUpdated, onCancel }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [spa, setSpa] = useState(spaToEdit);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState(spaToEdit.images || []);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Reset state when spaToEdit changes
    useEffect(() => {
        setSpa(spaToEdit);
        setImagePreviews(spaToEdit.images || []);
        setImageFiles([]);
        setErrors({});
    }, [spaToEdit]);

    // Validation schema
    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!spa.name?.trim()) newErrors.name = 'Name is required';
        if (!spa.type?.length) newErrors.type = 'At least one type is required';
        if (!spa.location?.address?.trim()) newErrors.address = 'Address is required';
        if (!spa.contacts?.number?.trim()) newErrors.number = 'Phone number is required';
        if (spa.contacts?.email && !/^\S+@\S+\.\S+$/.test(spa.contacts.email)) {
            newErrors.email = 'Invalid email format';
        }
        return newErrors;
    }, [spa]);

    // Memoized handlers
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSpa(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setSpa(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, []);

    const handleImageChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        // Validate file size and type
        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
            toast.warn('Some files were skipped. Please use images under 5MB in JPG, PNG, or WebP format.');
        }

        setImageFiles(validFiles);
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    }, []);

    // Add drag handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        if (draggedIndex !== index) {
            const newPreviews = [...imagePreviews];
            const newFiles = [...imageFiles];
            
            // Reorder previews
            const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
            newPreviews.splice(index, 0, draggedPreview);
            
            // Reorder files if they exist
            if (newFiles.length > 0) {
                const [draggedFile] = newFiles.splice(draggedIndex, 1);
                newFiles.splice(index, 0, draggedFile);
                setImageFiles(newFiles);
            }
            
            setImagePreviews(newPreviews);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Update the image preview section in the return statement
    const imagePreviewSection = (
        <div className="grid grid-cols-4 gap-4 mt-2">
            {imagePreviews.map((preview, index) => (
                <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative cursor-move transition-transform ${
                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                    }`}
                >
                    <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border-2 border-transparent hover:border-blue-500"
                    />
                    <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white px-2 rounded-full text-xs">
                        {index + 1}
                    </div>
                </div>
            ))}
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            toast.error('Please fix the form errors');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            const cleanSpaData = {
                ...spa, // Keep all existing spa data
                type: Array.isArray(spa.type) ? spa.type : spa.type.split(',').map(t => t.trim()),
                imageOrder: imagePreviews.map((_, index) => index)
            };

            formData.append('data', JSON.stringify(cleanSpaData));

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });
            }

            const updatedSpa = await updateSpa(spa._id, formData);
            
            if (updatedSpa) {
                toast.success('Spa updated successfully!');
                onSpaUpdated(updatedSpa);
            } else {
                throw new Error('Failed to update spa');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Failed to update spa');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup function
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [imagePreviews]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Update Spa</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={spa.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <input
                            type="text"
                            name="type"
                            value={spa.type.join(', ')}
                            onChange={(e) => setSpa(prev => ({
                                ...prev,
                                type: e.target.value.split(',').map(t => t.trim())
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter types separated by commas"
                        />
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Images</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {imagePreviewSection}
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            name="location.country"
                            value={spa.location.country}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            name="location.state"
                            value={spa.location.state}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <input
                            type="text"
                            name="location.district"
                            value={spa.location.district}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Locality</label>
                        <input
                            type="text"
                            name="location.locality"
                            value={spa.location.locality}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pincode</label>
                        <input
                            type="text"
                            name="location.pincode"
                            value={spa.location.pincode}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="location.address"
                            value={spa.location.address}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Pricing and Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Starting Price</label>
                        <input
                            type="number"
                            name="startingPrice"
                            value={spa.startingPrice}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={spa.discount}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <input
                            type="number"
                            name="rating"
                            value={spa.rating}
                            onChange={handleChange}
                            min="0"
                            max="5"
                            step="0.1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                            type="text"
                            name="coordinates.lat"
                            value={spa.coordinates.lat}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                            type="text"
                            name="coordinates.lng"
                            value={spa.coordinates.lng}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="contacts.number"
                            value={spa.contacts.number}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="contacts.email"
                            value={spa.contacts.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                            type="text"
                            name="contacts.website"
                            value={spa.contacts.website}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Working Days</label>
                        <input
                            type="text"
                            name="openingHours.days"
                            value={spa.openingHours.days}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                        <input
                            type="text"
                            name="openingHours.time"
                            value={spa.openingHours.time}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Map Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Map Link</label>
                    <input
                        type="text"
                        name="mapLink"
                        value={spa.mapLink}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {isSubmitting ? 'Updating...' : 'Update Spa'}
                </button>
            </form>
        </div>
    );
};

export default React.memo(UpdateSpa);
