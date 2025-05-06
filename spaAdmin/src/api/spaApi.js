import axios from 'axios';
import { getToken } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL;

// Get all spas
export const getSpas = async () => {
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_URL}/spas`, config);
    return response.data.data;
};

// Update spa
export const updateSpa = async (id, formData) => {
    try {
        const response = await fetch(`${API_URL}/spas/${id}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update spa');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Get spa by ID
export const getSpaById = async (id) => {
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_URL}/spas/${id}`, config);
    return response.data.data;
}

// Delete Spa 
export const deleteSpa = async (spaId) => {
    try {
        const token = localStorage.getItem('adminToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.delete(`${API_URL}/spas/${spaId}`, config);

        if (response.status !== 200 && response.status !== 204) {
            throw new Error('Failed to delete spa');
        }

        return true;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to delete spa');
        }
        throw new Error(error.message || 'Failed to delete spa');
    }
};

// Get getBooking
export const getBooking = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/v1/bookings', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

// Delete Booking
export const deleteBooking = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.delete(`${API_URL}/bookings/${id}`, config);

        if (response.status !== 200 && response.status !== 204) {
            throw new Error('Failed to delete spa');
        }

        return true;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to delete spa');
        }
        throw new Error(error.message || 'Failed to delete spa');
    }
};

// Get all users
export const getUsers = async (token) => {
    const response = await axios.get(`${API_URL}/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Delete user
export const deleteUser = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/auth/deleteUser/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status !== 200 && response.status !== 204) {
            throw new Error('Failed to delete user');
        }

        return true;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to delete user');
        }
        throw new Error(error.message || 'Failed to delete user');
    }
};
// Get total users
export const getUserStats = async (token) => {
    const response = await axios.get(`${API_URL}/auth/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// get total logedIn users
export const getTotalLogedInUsers = async () => {
    const response = await axios.get(`${API_URL}/users/total-logged-in`);
    return response.data;
};

// Get inquiry
export const getInquiry = async (token) => {
    const response = await axios.get(`${API_URL}/inquirySpa`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// Get user profile
export const getUserProfile = async (token) => {
    const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

