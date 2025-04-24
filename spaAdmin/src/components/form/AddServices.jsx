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
                `http://localhost:5000/api/v1/spas/${spaId}/services`,
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
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Services</h3>
                <button
                    type="button"
                    onClick={() => {
                        onAddService();
                        setCurrentServiceIndex(services.length);
                        setIsSidebarOpen(true);
                    }}
                    className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                    Add Service
                </button>
            </div>
            
            {services.map((service, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{service.title || 'New Service'}</h4>
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={() => handleEditService(index)}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemoveService(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            ))}

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
