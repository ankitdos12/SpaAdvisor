import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://spabackend-x1sr.onrender.com/api/v1";

// const API_URL = "http://localhost:5000/api/v1";

// Get all spas
export const getSpas = async () => {
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_URL}/spas`, config);
    return response.data.data;
};
// Update spa
export const updateSpa = async (id, spaData) => {
    try {
        const token = localStorage.getItem('adminToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.put(`${API_URL}/spas/${id}`, spaData, config);

        if (response.status !== 200 && response.status !== 204) {
            throw new Error('Failed to update spa');
        }

        return true;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to update spa');
        }
        throw new Error(error.message || 'Failed to update spa');
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
    const token = localStorage.getItem('adminToken');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`${API_URL}/bookings`, config);
    return response.data;
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
export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
};

// Get total users
export const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/users/total-signups`);
    return response.data;
};

// get total logedIn users
export const getTotalLogedInUsers = async () => {
    const response = await axios.get(`${API_URL}/users/total-logged-in`);
    return response.data;
};

