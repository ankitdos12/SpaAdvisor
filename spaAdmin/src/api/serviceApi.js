import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const addService = async (spaId, service) => {
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
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
};
