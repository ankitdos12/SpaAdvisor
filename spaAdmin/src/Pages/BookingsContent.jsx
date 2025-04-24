import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBooking, deleteBooking } from '../api/spaApi';

const MAX_RETRIES = 13;

const BookingsContent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                const response = await getBooking();
                console.log('Bookings:', response);
                
                setBookings(response);
                setLoading(false);
                return;
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError(err.response?.data?.message || 'Failed to fetch bookings');
                retries++;
                if (retries >= MAX_RETRIES) {
                    setLoading(false);
                    toast.error('Failed to fetch bookings after multiple attempts');
                    break;
                }
            }
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) {
            return;
        }

        try {
            setLoading(true);
            await deleteBooking(id);
            setBookings(prevBookings => prevBookings.filter(booking => booking._id !== id));
            toast.success('Booking deleted successfully!');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err.response?.data?.message || 'Failed to delete booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden ml-[14.5rem]">
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            ) : !bookings ? (
                <div className="p-6 text-center text-gray-500">No data available</div>
            ) : bookings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No bookings found</div>
            ) : (
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Phone</th>
                            <th className="p-4 text-left">Service Title</th>
                            <th className="p-4 text-left">Special Request</th>
                            <th className="p-4 text-left">Spa</th>
                            <th className="p-4 text-left">Spa Address</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">Time</th>
                            <th className="p-4 text-left">Delete</th>
                        </tr>
                    </thead>
                    {/* serviceTital */}
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                                <td className="p-4">{booking.name}</td>
                                <td className="p-4">{booking.email}</td>
                                <td className="p-4">{booking.phone}</td>
                                <td className="p-4 font-medium">{booking.serviceTital}</td>
                                <td className="p-4">{booking.special_request || 'N/A'}</td>
                                <td className="p-4 text-gray-500 text-sm">
                                    {booking.spa?.name || 'Not specified'}
                                </td>
                                <td className="p-4 text-gray-500 text-sm w-[23rem]">
                                    {booking.spa?.location?.address || 'Address not available'}
                                </td>
                                <td className="p-4">
                                    {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4">{booking.time || 'N/A'}</td>
                                <td className="p-4">
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteBooking(booking._id)}
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BookingsContent;