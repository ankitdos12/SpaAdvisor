import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const validateToken = (token) => {
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('Invalid authentication token');
  }
  return `Bearer ${token}`;
};

export const addService = async (spaId, service, token) => {
  try {
    const authHeader = validateToken(token);
    const formData = new FormData();

    Object.entries(service).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key !== 'imagePreview') {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/spas/${spaId}/services`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': authHeader
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Add service error:', error);
    throw error;
  }
};

export const getAllServices = async (spaId, token) => {
  try {
    const authHeader = validateToken(token);
    const response = await axios.get(
      `${API_BASE_URL}/spas/${spaId}/services`,
      {
        headers: { Authorization: authHeader }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Get services error:', error);
    throw error;
  }
};

export const updateService = async (spaId, serviceId, serviceData, token) => {
  try {
    const authHeader = validateToken(token);
    const formData = new FormData();
    Object.keys(serviceData).forEach(key => {
      if (key === 'image' && serviceData[key] instanceof File) {
        formData.append('image', serviceData[key]);
      } else if (Array.isArray(serviceData[key])) {
        formData.append(key, JSON.stringify(serviceData[key]));
      } else {
        formData.append(key, serviceData[key]);
      }
    });

    const response = await axios.put(
      `${API_BASE_URL}/spas/${spaId}/services/${serviceId}`,
      formData,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update service error:', error);
    throw error;
  }
};

export const deleteService = async (spaId, serviceId, token) => {
  try {
    const authHeader = validateToken(token);
    const response = await axios.delete(
      `${API_BASE_URL}/spas/${spaId}/services/${serviceId}`,
      {
        headers: { Authorization: authHeader }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Delete service error:', error);
    throw error;
  }
};
