import React, { useState } from 'react';
import ServiceSidebar from './ServiceSidebar';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddServices = ({ services, onServiceChange, onAddService, onRemoveService, spaId }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentServiceIndex, setCurrentServiceIndex] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditService = (index) => {
        setCurrentServiceIndex(index);
        setIsSidebarOpen(true);
    };

    const handleSaveService = async (serviceData) => {
        if (!spaId) {
            toast.error('Spa ID is required to add services');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `https://spabackend-x1sr.onrender.com/api/v1/spas/${spaId}/services`,
                serviceData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                toast.success('Service added successfully!');
                setCurrentServiceIndex(null);
                setIsSidebarOpen(false);
                // Optionally refresh services list here
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add service';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center sm:text-left">Services</h3>
                <button
                    type="button"
                    onClick={() => {
                        onAddService();
                        setCurrentServiceIndex(services.length);
                        setIsSidebarOpen(true);
                    }}
                    className="w-full sm:w-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200"
                >
                    Add Service
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                    <div key={index} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <h4 className="font-semibold text-center sm:text-left w-full sm:w-auto">
                                {service.title || 'New Service'}
                            </h4>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditService(index)}
                                    className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemoveService(index)}
                                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ServiceSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                service={currentServiceIndex !== null ? services[currentServiceIndex] : {}}
                onChange={onServiceChange}
                onSave={handleSaveService}
                index={currentServiceIndex}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default AddServices;
