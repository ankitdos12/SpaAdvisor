import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSpas, deleteSpa } from '../api/spaApi';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getToken } from '../utils/token';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const SpaList = () => {
    const navigate = useNavigate();
    const [spas, setSpas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterDiscount, setFilterDiscount] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pageInput, setPageInput] = useState('');

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

    // Modify the filteredAndSortedSpas memo to include pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedSpas.slice(startIndex, endIndex);
    }, [filteredAndSortedSpas, currentPage, itemsPerPage]);

    // Add pagination controls
    const totalPages = Math.ceil(filteredAndSortedSpas.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        setPageInput(value);
    };

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const pageNumber = parseInt(pageInput);
        if (pageNumber && pageNumber > 0 && pageNumber <= totalPages) {
            handlePageChange(pageNumber);
        } else {
            toast.error('Invalid page number');
        }
        setPageInput('');
    };

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

    const exportToExcel = () => {
        const exportData = filteredAndSortedSpas.map(spa => ({
            'Name': spa.name,
            'Website': spa.contacts.website,
            'Location': `${spa.location.locality}, ${spa.location.district}`,
            'Starting Price': spa.startingPrice,
            'Discount': `${spa.discount}%`,
            'ID': spa._id
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Spas');
        XLSX.writeFile(wb, 'spas_list.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Name', 'Location', 'Price', 'Discount'];
        const tableRows = filteredAndSortedSpas.map(spa => [
            spa.name,
            `${spa.location.locality}, ${spa.location.district}`,
            `₹${spa.startingPrice}`,
            `${spa.discount}%`
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save('spas_list.pdf');
    };

    const exportToCSV = () => {
        const exportData = filteredAndSortedSpas.map(spa => ({
            'Name': spa.name,
            'Website': spa.contacts.website,
            'Location': `${spa.location.locality}, ${spa.location.district}`,
            'Starting Price': spa.startingPrice,
            'Discount': spa.discount,
            'ID': spa._id
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Spas');
        XLSX.writeFile(wb, 'spas_list.csv');
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
            <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <div className="animate-pulse space-y-2 sm:space-y-4">
                    {[...Array(5)].map((_, idx) => (
                        <div key={idx} className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {getToken() ? (
                <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-0">Spa Management</h1>
                        <div className="flex flex-wrap gap-2">
                            <div className="text-sm sm:text-base lg:text-lg text-gray-600 mr-4">
                                Total Spas: {spas.length}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportToExcel}
                                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Export Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Export PDF
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
                            <div className="flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search spas..."
                                    onChange={(e) => debouncedSearch(e.target.value)}
                                    className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex flex-row sm:flex-row gap-2 sm:gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                    <option value="discountDesc">Highest Discount</option>
                                </select>

                                <label className="flex items-center space-x-2 whitespace-nowrap text-sm sm:text-base">
                                    <input
                                        type="checkbox"
                                        checked={filterDiscount}
                                        onChange={() => setFilterDiscount(!filterDiscount)}
                                        className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
                                    />
                                    <span>Show Discounted</span>
                                </label>
                            </div>
                        </div>

                        <div className="overflow-x-auto shadow-sm rounded-lg -mx-2 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Spa Name
                                            </th>
                                            <th className="hidden md:table-cell px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Website
                                            </th>
                                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="hidden md:table-cell px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Spa ID
                                            </th>
                                            <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedData.map((spa) => (
                                            <tr key={spa._id} className={`hover:bg-gray-50 ${actionInProgress === spa._id ? 'opacity-50' : ''}`}>
                                                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                                                    <div className="text-sm sm:text-base font-medium text-gray-900">{spa.name}</div>
                                                    <div className="md:hidden text-xs text-blue-600 mt-1">
                                                        <a href={spa.contacts.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            Website
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <a href={spa.contacts.website} target="_blank" rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline truncate max-w-xs block">
                                                        {spa.contacts.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </td>
                                                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
                                                    <div className="truncate max-w-[150px] sm:max-w-xs">
                                                        {spa.location.locality}, {spa.location.district}
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <div className="text-sm sm:text-base text-gray-900">₹{spa.startingPrice}</div>
                                                    {spa.discount > 0 && (
                                                        <div className="text-xs sm:text-sm text-red-500">{spa.discount}% Off</div>
                                                    )}
                                                </td>
                                                <td className="hidden md:table-cell px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-sm font-medium text-gray-900">{spa._id}</div>
                                                        <button onClick={() => handleCopyId(spa._id)}
                                                            className="p-1 text-gray-500 hover:text-blue-600">
                                                            {copiedId === spa._id ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                    <div className="flex flex-row gap-3">
                                                        <button
                                                            onClick={() => navigate(`/spas/edit/${spa._id}`)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Edit"
                                                        >
                                                            <FiEdit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(spa._id)}
                                                            disabled={actionInProgress === spa._id}
                                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                                            title="Delete"
                                                        >
                                                            {actionInProgress === spa._id ? (
                                                                <span className="loading">...</span>
                                                            ) : (
                                                                <FiTrash2 className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Items per page:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="border rounded-md px-2 py-1 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded-md border disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded-md border disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        placeholder="Go to page"
                                        className="w-16 px-2 py-1 border rounded-md text-sm"
                                        min="1"
                                        max={totalPages}
                                    />
                                    <button
                                        type="submit"
                                        className="px-2 py-1 rounded-md border bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        Go
                                    </button>
                                </form>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded-md border disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded-md border disabled:opacity-50"
                                >
                                    Last
                                </button>
                            </div>

                            <div className="text-sm text-gray-700">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSpas.length)} of {filteredAndSortedSpas.length} items
                            </div>
                        </div>

                        {filteredAndSortedSpas.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <p className="text-lg sm:text-xl text-gray-500">
                                    No spas found matching your search criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Access Required</h2>
                        <p className="text-red-500 mb-6">Please log in to manage spas.</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SpaList;