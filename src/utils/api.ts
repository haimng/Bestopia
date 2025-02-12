const API_BASE_URL = '/api';

const getAuthToken = () => {
    return localStorage.getItem('token');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
};

export const apiGet = (endpoint: string, options: RequestInit = {}) => {
    return apiRequest(endpoint, { ...options, method: 'GET' });
};

export const apiPost = (endpoint: string, body: any, options: RequestInit = {}) => {
    return apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
};

export const apiPut = (endpoint: string, body: any, options: RequestInit = {}) => {
    return apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
};

export const apiDelete = (endpoint: string, options: RequestInit = {}) => {
    return apiRequest(endpoint, { ...options, method: 'DELETE' });
};
