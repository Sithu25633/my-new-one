
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Photo } from '../types';
import { getPhotos } from '../services/api';

interface SettingsPageProps {
  setAppBackground: (url: string | null) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setAppBackground }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBackground, setSelectedBackground] = useState<string | null>(localStorage.getItem('appBackground'));

    const fetchPhotos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPhotos();
            setPhotos(data);
        } catch (error) {
            toast.error("Failed to load photos for background selection.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const handleSetBackground = (photoUrl: string) => {
        localStorage.setItem('appBackground', photoUrl);
        setAppBackground(photoUrl);
        setSelectedBackground(photoUrl);
        toast.success("Background updated!");
    };
    
    const handleResetBackground = () => {
        localStorage.removeItem('appBackground');
        const defaultBg = 'https://picsum.photos/1920/1080?random=1';
        setAppBackground(defaultBg);
        setSelectedBackground(null);
        toast.success("Background reset to default.");
    }

    return (
        <div>
            <h1 className="font-serif text-4xl mb-6">Settings</h1>
            <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                <h2 className="text-2xl font-serif mb-4">Choose Our Background</h2>
                <p className="text-white/70 mb-6">Select one of our photos to be the background for our entire space.</p>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {photos.map(photo => (
                            <motion.div
                                key={photo.id}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleSetBackground(photo.url)}
                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-4 transition-colors ${selectedBackground === photo.url ? 'border-red-500' : 'border-transparent'}`}
                            >
                                <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30"></div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/70 py-10">Upload some photos first to use them as a background.</p>
                )}
                
                <button onClick={handleResetBackground} className="mt-6 px-6 py-2 bg-white/20 rounded-md hover:bg-white/30 transition">
                    Reset to Default
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
