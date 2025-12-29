
import { Photo, Video, Letter } from '../types';

// ============================================================================
// MOCK BACKEND - This file simulates a backend API using localStorage.
// In a real application, this would be replaced with actual HTTP requests
// to a Node.js/Express server running on your VPS.
// ============================================================================

const MOCK_LATENCY = 500; // ms

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper for generating unique IDs
const uuid = () => crypto.randomUUID();

// --- Initialization: Load data from localStorage or set defaults ---

const initData = <T,>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return defaultValue;
  }
};

let mockUser = initData<any>('mockUser', []);
let mockPhotos = initData<Photo>('mockPhotos', []);
let mockVideos = initData<Video>('mockVideos', []);
let mockLetters = initData<Letter>('mockLetters', []);


// --- Auth ---

export const loginOrRegister = async (username: string, password: string): Promise<{ token: string }> => {
    await delay(MOCK_LATENCY);
    if (mockUser.length === 0) {
        // First time: Register the account
        mockUser.push({ username, password });
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        return { token: 'mock-jwt-token-for-' + username };
    } else {
        // Login
        const user = mockUser[0];
        if (user.username === username && user.password === password) {
            return { token: 'mock-jwt-token-for-' + username };
        } else {
            throw new Error('Invalid credentials');
        }
    }
};

// --- Photos ---

export const getPhotos = async (): Promise<Photo[]> => {
    await delay(MOCK_LATENCY);
    return [...mockPhotos];
};

export const uploadPhotos = async (files: FileList, category: string): Promise<void> => {
    await delay(MOCK_LATENCY * 2);
    const newPhotos: Photo[] = Array.from(files).map(file => ({
        id: uuid(),
        url: URL.createObjectURL(file), // Simulates a URL from VPS storage
        category,
        createdAt: new Date().toISOString(),
        name: file.name,
    }));
    mockPhotos.push(...newPhotos);
    localStorage.setItem('mockPhotos', JSON.stringify(mockPhotos));
};

export const deletePhoto = async (id: string): Promise<void> => {
    await delay(MOCK_LATENCY);
    mockPhotos = mockPhotos.filter(p => p.id !== id);
    localStorage.setItem('mockPhotos', JSON.stringify(mockPhotos));
}

// --- Videos ---

export const getVideos = async (): Promise<Video[]> => {
    await delay(MOCK_LATENCY);
    return [...mockVideos];
};

export const uploadVideos = async (files: FileList, category: string): Promise<void> => {
    await delay(MOCK_LATENCY * 3);
    const newVideos: Video[] = Array.from(files).map(file => ({
        id: uuid(),
        url: URL.createObjectURL(file),
        category,
        createdAt: new Date().toISOString(),
        name: file.name,
    }));
    mockVideos.push(...newVideos);
    localStorage.setItem('mockVideos', JSON.stringify(mockVideos));
};

export const deleteVideo = async (id: string): Promise<void> => {
    await delay(MOCK_LATENCY);
    mockVideos = mockVideos.filter(v => v.id !== id);
    localStorage.setItem('mockVideos', JSON.stringify(mockVideos));
};

// --- Letters ---

export const getLetters = async (): Promise<Letter[]> => {
    await delay(MOCK_LATENCY);
    return [...mockLetters];
};

export const createLetter = async (letterData: Partial<Letter>): Promise<Letter> => {
    await delay(MOCK_LATENCY);
    const newLetter: Letter = {
        id: uuid(),
        title: letterData.title || 'Untitled',
        content: letterData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    mockLetters.push(newLetter);
    localStorage.setItem('mockLetters', JSON.stringify(mockLetters));
    return newLetter;
};

export const updateLetter = async (id: string, letterData: Partial<Letter>): Promise<Letter> => {
    await delay(MOCK_LATENCY);
    const letterIndex = mockLetters.findIndex(l => l.id === id);
    if (letterIndex === -1) throw new Error('Letter not found');
    const updatedLetter = {
        ...mockLetters[letterIndex],
        ...letterData,
        updatedAt: new Date().toISOString(),
    };
    mockLetters[letterIndex] = updatedLetter;
    localStorage.setItem('mockLetters', JSON.stringify(mockLetters));
    return updatedLetter;
};

export const deleteLetter = async (id: string): Promise<void> => {
    await delay(MOCK_LATENCY);
    mockLetters = mockLetters.filter(l => l.id !== id);
    localStorage.setItem('mockLetters', JSON.stringify(mockLetters));
};
