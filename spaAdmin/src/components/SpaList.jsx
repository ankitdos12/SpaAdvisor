import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSpas, deleteSpa } from '../api/spaApi';
import debounce from 'lodash.debounce';

// Spa Form Component (Previous implementation remains the same)
const SpaForm = () => {
    // ... (previous SpaForm code)
};

// Spa List Component
const SpaList = () => {
    const [spas, setSpas] = useState([]);
    const [selectedSpa, setSelectedSpa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterDiscount, setFilterDiscount] = useState(false);

    const fetchSpas = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await getSpas();
            console.log('Spas fetched:', response);
            
            setSpas(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch spas');
        } finally {
            setIsLoading(false);
            setIsRetrying(false);
        }
    }, []);

    // Debounced search handler
    const debouncedSearch = useMemo(
        () => debounce((term) => setSearchTerm(term), 300),
        []
    );

    useEffect(() => {
        fetchSpas();
        return () => debouncedSearch.cancel();
    }, [fetchSpas, debouncedSearch]);

    // Memoized filtered and sorted spas
    const filteredAndSortedSpas = useMemo(() => {
        try {
            let result = [...spas];

            if (searchTerm) {
                const lowercasedTerm = searchTerm.toLowerCase();
                result = result.filter(spa =>
                    spa.name.toLowerCase().includes(lowercasedTerm) ||
                    spa.location.locality.toLowerCase().includes(lowercasedTerm) ||
                    spa.location.district.toLowerCase().includes(lowercasedTerm) ||
                    spa._id.toString().includes(lowercasedTerm)
                );
            }

            if (filterDiscount) {
                result = result.filter(spa => spa.discount > 0);
            }

            return result.sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'priceAsc':
                        return a.startingPrice - b.startingPrice;
                    case 'priceDesc':
                        return b.startingPrice - a.startingPrice;
                    case 'discountDesc':
                        return b.discount - a.discount;
                    default:
                        return 0;
                }
            });
        } catch (err) {
            console.error('Error in filtering/sorting:', err);
            return [];
        }
    }, [spas, searchTerm, sortBy, filterDiscount]);

    const handleDelete = async (spaId) => {
        if (!window.confirm('Are you sure you want to delete this spa?')) {
            return;
        }

        try {
            setActionInProgress(spaId);
            await deleteSpa(spaId);
            setSpas(spas.filter(spa => spa._id !== spaId));
        } catch (err) {
            setError(`Failed to delete spa: ${err.message}`);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleEdit = (spa) => {
        setSelectedSpa(spa);
        setIsEditing(true);
    };

    const handleSpaAdded = (newOrUpdatedSpa) => {
        if (selectedSpa) {
            // Update existing spa
            setSpas(spas.map(spa =>
                spa._id === newOrUpdatedSpa._id ? newOrUpdatedSpa : spa
            ));
        } else {
            // Add new spa with a generated ID
            const newSpa = {
                ...newOrUpdatedSpa,
                _id: `${spas.length + 1}`
            };
            setSpas([...spas, newSpa]);
        }

        // Reset editing state
        setSelectedSpa(null);
        setIsEditing(false);
    };

    const cancelEditing = () => {
        setSelectedSpa(null);
        setIsEditing(false);
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id)
            .then(() => {
                setCopiedId(id);
                setTimeout(() => {
                    setCopiedId(null);
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy ID:', err);
            });
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => {
                        setIsRetrying(true);
                        fetchSpas();
                    }}
                    disabled={isRetrying}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Spa Management</h1>
                <div className="text-lg text-gray-600">
                    Total Spas: {spas.length}
                </div>
            </div>

            {isEditing && (
                <SpaForm
                    onSpaAdded={handleSpaAdded}
                    spaToEdit={selectedSpa}
                    onCancel={cancelEditing}
                />
            )}

            {!isEditing && (
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-grow">
                            <input
                                type="text"
                                placeholder="Search spas by name or location"
                                onChange={(e) => debouncedSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="discountDesc">Highest Discount</option>
                        </select>

                        {/* Discount Filter */}
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={filterDiscount}
                                onChange={() => setFilterDiscount(!filterDiscount)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span>Discounted Spas Only</span>
                        </label>
                    </div>

                    {/* Spa Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spa Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Website
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spa ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAndSortedSpas.map((spa) => (
                                    <tr
                                        key={spa._id}
                                        className={`hover:bg-gray-50 ${actionInProgress === spa._id ? 'opacity-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{spa.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={spa.contacts.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline truncate max-w-xs block"
                                            >
                                                {spa.contacts.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {spa.location.locality}, {spa.location.district}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900">₹{spa.startingPrice}</div>
                                            {spa.discount > 0 && (
                                                <div className="text-sm text-red-500">{spa.discount}% Off</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="font-medium text-gray-900">{spa._id}</div>
                                                <button
                                                    onClick={() => handleCopyId(spa._id)}
                                                    className="p-1 text-gray-500 hover:text-blue-600"
                                                    title={copiedId === spa._id ? "Copied!" : "Copy ID"}
                                                >
                                                    {copiedId === spa._id ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(spa)}
                                                    disabled={actionInProgress === spa._id}
                                                    className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(spa._id)}
                                                    disabled={actionInProgress === spa._id}
                                                    className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                                >
                                                    {actionInProgress === spa._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredAndSortedSpas.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-500">
                                No spas found matching your search criteria.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SpaList;