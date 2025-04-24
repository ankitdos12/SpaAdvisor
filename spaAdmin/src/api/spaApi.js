import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Get all spas
export const getSpas = async () => {
    const response = await axios.get(`${API_URL}/spas`);
    return response.data.data;
};
// Get spa by ID
export const getSpaById = async (id) => {
    const response = await axios.get(`${API_URL}/spas/${id}`);
    return response.data.data;
}
// Delete Spa 
export const deleteSpa = async (spaId) => {
    try {
        const response = await axios.delete(`${API_URL}/spas/${spaId}`);

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
    const response = await axios.get(`${API_URL}/bookings`);
    return response.data;
};

// Delete Booking
export const deleteBooking = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/bookings/${id}`);

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

// User Signup
export const signup = async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
};

// User Login
export const login = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    return response.data;
};