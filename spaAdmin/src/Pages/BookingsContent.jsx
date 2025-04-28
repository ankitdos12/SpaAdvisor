import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBooking, deleteBooking } from '../api/spaApi';
import { getToken } from "../utils/token";

const MAX_RETRIES = 13;

const BookingsContent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                const response = await getBooking();
                setBookings(response);
                setLoading(false);
                return;
            } catch (err) {
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
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            setLoading(true);
            await deleteBooking(id);
            setBookings(prev => prev.filter(b => b._id !== id));
            toast.success('Booking deleted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete booking');
        } finally {
            setLoading(false);
        }
    };

    const renderMobileBookingCard = (booking) => (
        <div key={booking._id} className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold">Customer:</div>
                <div>{booking.name}</div>
                <div className="font-semibold">Email:</div>
                <div>{booking.email}</div>
                <div className="font-semibold">Phone:</div>
                <div>{booking.phone}</div>
                <div className="font-semibold">Service:</div>
                <div className="font-medium">{booking.serviceTital}</div>
                <div className="font-semibold">Spa:</div>
                <div>{booking.spa?.name || 'Not specified'}</div>
                <div className="font-semibold">Date:</div>
                <div>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</div>
                <div className="font-semibold">Time:</div>
                <div>{booking.time || 'N/A'}</div>
                {booking.special_request && (
                    <>
                        <div className="font-semibold">Special Request:</div>
                        <div>{booking.special_request}</div>
                    </>
                )}
                <div className="font-semibold">Address:</div>
                <div className="truncate">{booking.spa?.location?.address || 'Address not available'}</div>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    className="text-red-500 hover:text-red-700 p-2 border border-red-200 rounded"
                    onClick={() => handleDeleteBooking(booking._id)}
                    title="Delete Booking"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.23 5.79c.342.052.682.107 1.022.166M19.23 5.79L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.77 5.79M19.23 5.79a48.11 48.11 0 00-3.478-.397M5.75 5.956c.34-.059.68-.114 1.022-.165m0 0A48.11 48.11 0 0110.25 5.39m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    );

    return (
      <>{
        getToken() ? (
            <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="max-w-full mx-auto bg-white shadow-md rounded-lg overflow-hidden my-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">No bookings found</div>
                ) : isMobile ? (
                    <div className="p-2 sm:p-4">{bookings.map(renderMobileBookingCard)}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-[1000px] w-full text-xs md:text-sm lg:text-base">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Phone</th>
                                    <th className="p-3 text-left">Service</th>
                                    <th className="p-3 text-left">Request</th>
                                    <th className="p-3 text-left">Spa</th>
                                    <th className="p-3 text-left">Address</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50">
                                        <td className="p-3 truncate">{b.name}</td>
                                        <td className="p-3 truncate max-w-[150px]">{b.email}</td>
                                        <td className="p-3 truncate">{b.phone}</td>
                                        <td className="p-3 font-medium truncate">{b.serviceTital}</td>
                                        <td className="p-3 truncate">{b.special_request || '—'}</td>
                                        <td className="p-3 text-gray-600 truncate">{b.spa?.name || '—'}</td>
                                        <td className="p-3 text-gray-600 max-w-[150px] truncate">{b.spa?.location?.address || '—'}</td>
                                        <td className="p-3 truncate">{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                                        <td className="p-3 truncate">{b.time || '—'}</td>
                                        <td className="p-3">
                                            <button
                                                className="text-red-500 hover:text-red-700 p-1"
                                                onClick={() => handleDeleteBooking(b._id)}
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.23 5.79c.342.052.682.107 1.022.166M19.23 5.79L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.77 5.79M19.23 5.79a48.11 48.11 0 00-3.478-.397M5.75 5.956c.34-.059.68-.114 1.022-.165m0 0A48.11 48.11 0 0110.25 5.39m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
        ):(
            <div className="flex flex-col items-center justify-center bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
                <p className="text-gray-600">Please log in to view this page.</p>
            </div>
        )
      }</>
    );
};

export default BookingsContent;
