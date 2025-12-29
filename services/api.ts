
import { Photo, Video, Letter } from '../types';
import { API_BASE_URL } from '../constants';

// Helper function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    // Do not set Content-Type for FormData, browser does it.
    if (!(options.body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Request failed');
    }

    // Handle responses with no content
    if (response.status === 204) {
        return;
    }

    return response.json();
};

// --- Auth ---

export const loginOrRegister = async (username: string, password: string): Promise<{ token: string }> => {
    return apiRequest('/api/auth/register-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

// --- Photos ---

export const getPhotos = async (): Promise<Photo[]> => {
    const photos = await apiRequest('/api/photos');
    // Prepend base URL to photo paths
    return photos.map((p: Photo) => ({ ...p, url: `${API_BASE_URL}${p.url}` }));
};

export const uploadPhotos = async (files: FileList, category: string): Promise<void> => {
    const formData = new FormData();
    formData.append('category', category);
    for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
    }
    await apiRequest('/api/photos', {
        method: 'POST',
        body: formData,
    });
};

export const deletePhoto = async (id: string): Promise<void> => {
    await apiRequest(`/api/photos/${id}`, { method: 'DELETE' });
};

// --- Videos ---

export const getVideos = async (): Promise<Video[]> => {
    const videos = await apiRequest('/api/videos');
    // Prepend base URL to video paths
    return videos.map((v: Video) => ({ ...v, url: `${API_BASE_URL}${v.url}` }));
};

export const uploadVideos = async (files: FileList, category: string): Promise<void> => {
    const formData = new FormData();
    formData.append('category', category);
    for (let i = 0; i < files.length; i++) {
        formData.append('videos', files[i]);
    }
    await apiRequest('/api/videos', {
        method: 'POST',
        body: formData,
    });
};

export const deleteVideo = async (id: string): Promise<void> => {
    await apiRequest(`/api/videos/${id}`, { method: 'DELETE' });
};

// --- Letters ---

export const getLetters = async (): Promise<Letter[]> => {
    return apiRequest('/api/letters');
};

export const createLetter = async (letterData: Partial<Letter>): Promise<Letter> => {
    return apiRequest('/api/letters', {
        method: 'POST',
        body: JSON.stringify(letterData),
    });
};

export const updateLetter = async (id: string, letterData: Partial<Letter>): Promise<Letter> => {
    return apiRequest(`/api/letters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(letterData),
    });
};

export const deleteLetter = async (id: string): Promise<void> => {
    await apiRequest(`/api/letters/${id}`, { method: 'DELETE' });
};
