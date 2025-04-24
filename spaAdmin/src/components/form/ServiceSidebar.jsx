import React from 'react';
import FormInput from './FormInput';

const ServiceSidebar = ({ isOpen, onClose, service, onChange, onSave, index, isSubmitting }) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(service);
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add Service</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Service Title"
                        name="title"
                        value={service.title}
                        onChange={(e) => onChange(index, e)}
                        required
                    />
                    <FormInput
                        label="Description"
                        name="description"
                        value={service.description}
                        onChange={(e) => onChange(index, e)}
                        required
                    />
                    <FormInput
                        label="Category"
                        name="category"
                        value={service.category}
                        onChange={(e) => onChange(index, e)}
                    />
                    <FormInput
                        label="Price"
                        type="number"
                        name="price"
                        value={service.price}
                        onChange={(e) => onChange(index, e)}
                        required
                    />
                    <FormInput
                        label="Duration (comma-separated)"
                        name="duration"
                        value={Array.isArray(service.duration) ? service.duration.join(', ') : ''}
                        onChange={(e) => onChange(index, e)}
                    />
                    <FormInput
                        label="Image URL"
                        name="image"
                        value={service.image}
                        onChange={(e) => onChange(index, e)}
                    />
                    <FormInput
                        label="Details (comma-separated)"
                        name="details"
                        value={Array.isArray(service.details) ? service.details.join(', ') : ''}
                        onChange={(e) => onChange(index, e)}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Service'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ServiceSidebar;
