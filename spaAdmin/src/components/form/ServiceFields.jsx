import React from 'react';
import FormInput from './FormInput';
import FormTextArea from './FormTextArea';

const ServiceFields = ({ service, onChange, onRemove, index }) => {
    return (
        <div className="border p-3 sm:p-4 mb-4 rounded-md shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormInput
                    label="Service Title"
                    name="title"
                    value={service.title}
                    onChange={(e) => onChange(index, e)}
                    required
                    placeholder="e.g. Swedish Massage"
                />
                <FormInput
                    label="Category"
                    name="category"
                    value={service.category}
                    onChange={(e) => onChange(index, e)}
                    required
                    placeholder="e.g. Massage Therapy"
                />
            </div>
            <div className="mt-3 sm:mt-4">
                <FormTextArea
                    label="Description"
                    name="description"
                    value={service.description}
                    onChange={(e) => onChange(index, e)}
                    required
                    placeholder="Enter detailed description of the service"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <FormInput
                    label="Price"
                    name="price"
                    type="number"
                    value={service.price}
                    onChange={(e) => onChange(index, e)}
                    required
                    placeholder="Enter service price"
                />
                <FormInput
                    label="Duration (comma-separated)"
                    name="duration"
                    value={service.duration.join(', ')}
                    onChange={(e) => onChange(index, e)}
                    placeholder="e.g. 30 mins, 60 mins"
                />
                <FormInput
                    label="Image URL"
                    name="image"
                    value={service.image}
                    onChange={(e) => onChange(index, e)}
                    required
                    placeholder="Enter service image URL"
                />
            </div>
            <div className="mt-3 sm:mt-4">
                <FormInput
                    label="Additional Details (comma-separated)"
                    name="details"
                    value={service.details.join(', ')}
                    onChange={(e) => onChange(index, e)}
                    placeholder="e.g. Hot stones, Essential oils"
                />
            </div>
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-4 w-full sm:w-auto bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
                Remove Service
            </button>
        </div>
    );
};

export default ServiceFields;
