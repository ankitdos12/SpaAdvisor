import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RiDeleteBin6Line } from "react-icons/ri";
import { getToken } from "../utils/token.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const BookingsContent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState({});
    const tableData = [
        "Username",
        "Number",
        "Date",
        "Time",
        "Spa Name",
        "Service",
        "Request",
        "Status",
        "Actions"
    ];

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            setBookings(response.data.data);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            setLoading(false);
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        setUpdateLoading(prev => ({ ...prev, [id]: true }));
        try {
            await axios.delete(`${API_BASE_URL}/bookings/${id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            setBookings(bookings.filter(booking => booking._id !== id));
            toast.success('Booking deleted successfully');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete booking';
            toast.error(errorMessage);
        } finally {
            setUpdateLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const updateStatus = async (id, newStatus) => {
        setUpdateLoading(prev => ({ ...prev, [id]: true }));
        try {
            await axios.put(
                `${API_BASE_URL}/bookings/${id}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );
            setBookings(bookings.map(booking =>
                booking._id === id ? { ...booking, status: newStatus } : booking
            ));
            toast.success('Status updated successfully');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update status';
            toast.error(errorMessage);
        } finally {
            setUpdateLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const exportToExcel = () => {
        const exportData = bookings.map(booking => ({
            'Customer Name': booking.name,
            'Phone': booking.phone,
            'Date': new Date(booking.date).toLocaleDateString(),
            'Time': booking.time,
            'Spa Name': booking.spa?.name || 'N/A',
            'Service': booking.serviceTital,
            'Special Request': booking.special_request,
            'Status': booking.status || 'Pending'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
        XLSX.writeFile(wb, 'bookings_list.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ['Customer', 'Phone', 'Date', 'Time', 'Spa', 'Status'];
        const tableRows = bookings.map(booking => [
            booking.name,
            booking.phone,
            new Date(booking.date).toLocaleDateString(),
            booking.time,
            booking.spa?.name || 'N/A',
            booking.status || 'Pending'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save('bookings_list.pdf');
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">All Bookings</h2>
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
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg shadow">
                <div className="align-middle inline-block min-w-full">
                    <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        {/* Table - Bookings */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {tableData.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Table - Bookings Content */}
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.name}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.phone}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.spa?.name || 'N/A'}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.serviceTital}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.special_request}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="text-sm border-none outline-none rounded-full px-3 py-1.5 font-semibold border-0 focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                                                value={booking.status || 'Pending'}
                                                onChange={(e) => updateStatus(booking._id, e.target.value)}
                                                disabled={updateLoading[booking._id]}
                                                style={{
                                                    backgroundColor:
                                                        booking.status === 'completed' ? '#4ADE80' :
                                                            booking.status === 'cancelled' ? '#FF4842' :
                                                                booking.status === 'confirmed' ? '#54D8FF' : '#FFA500',
                                                    color:
                                                        booking.status === 'completed' ? '#FFFFFF' :
                                                            booking.status === 'cancelled' ? '#FFFFFF' :
                                                                booking.status === 'confirmed' ? '#FFFFFF' : '#FFFFFF',
                                                    cursor: updateLoading[booking._id] ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(booking._id)}
                                                disabled={updateLoading[booking._id]}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                                                title="Delete booking"
                                                aria-label="Delete booking"
                                            >
                                                {updateLoading[booking._id] ? (
                                                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-1px]"></span>
                                                ) : (
                                                    <RiDeleteBin6Line className="h-5 w-5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingsContent;
