import React from 'react';

const ServiceSidebar = ({ isOpen, onClose, service, onChange, onSave, index, isSubmitting }) => {
    const sidebarClasses = `fixed right-0 top-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out w-full sm:w-96 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

    const overlayClasses = `fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(service);
    };

    return (
        <>
            <div className={overlayClasses} onClick={onClose} />
            <div className={sidebarClasses}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            {index !== null ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Service Title
                            </label>
                            <input
                                type="text"
                                value={service.title || ''}
                                onChange={(e) => onChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={service.description || ''}
                                onChange={(e) => onChange(index, 'description', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Price
                            </label>
                            <input
                                type="number"
                                value={service.price || ''}
                                onChange={(e) => onChange(index, 'price', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={service.duration || ''}
                                onChange={(e) => onChange(index, 'duration', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </form>

                    <div className="p-4 border-t">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Service'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceSidebar;
