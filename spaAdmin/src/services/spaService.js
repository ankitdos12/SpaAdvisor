const API_BASE_URL = 'http://localhost:5000/api/v1';

export const updateSpa = async (spaId, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/spas/${spaId}`, {
            method: 'PUT',
            body: formData,
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update spa');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
