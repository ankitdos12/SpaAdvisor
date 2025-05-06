import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../api/spaApi';
import { getToken } from '../utils/token';
import { FaHome } from 'react-icons/fa';

const UserProfile = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        role: ''
    });
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchUserProfile = async () => {
            try {
                const response = await getUserProfile(getToken());
                console.log("response from user Profile: ", response);

                if (response.status === "success") {
                    setUserData({
                        username: response.data.user.username,
                        email: response.data.user.email,
                        phoneNumber: response.data.user.phoneNumber,
                        role: response.data.user.role
                    });

                    setBookings(response.data.bookings || []);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError("Error fetching user profile");
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserProfile();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({ ...userData });
    };

    const handleSave = async () => {
        try {
            // TODO: Implement API call to update profile
            setUserData(editedData);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData({});
    };

    const handleInputChange = (e) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value
        });
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                // TODO: Implement API call to cancel booking
                setBookings(bookings.filter(booking => booking._id !== bookingId));
            } catch (error) {
                console.error("Error canceling booking:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 pt-24 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Information Card */}
                <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                    <div className="bg-blue-600 h-48 flex items-center justify-center relative">
                        <button 
                            onClick={() => navigate('/')} 
                            className="absolute top-4 left-4 text-white hover:text-gray-200"
                        >
                            <FaHome size={24} />
                        </button>
                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                            <img src="https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369988.png" className='object-contain' />
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold">Profile Information</h1>
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries({
                                'Full Name': 'username',
                                'Email': 'email',
                                'Phone': 'phoneNumber',
                                'Role': 'role'
                            }).map(([label, key]) => (
                                <div key={key} className="border-b pb-4">
                                    <label className="text-sm text-gray-600">{label}</label>
                                    {isEditing && key !== 'role' ? (
                                        <input
                                            type="text"
                                            name={key}
                                            value={editedData[key] || ''}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold capitalize">{userData[key]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
