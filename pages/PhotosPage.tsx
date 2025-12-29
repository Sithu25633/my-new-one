
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Photo } from '../types';
import { getPhotos, uploadPhotos, deletePhoto } from '../services/api';
import { UploadIcon, CloseIcon } from '../components/icons';

const PhotoGrid: React.FC<{ photos: Photo[], onSelect: (photo: Photo) => void, onDelete: (id: string) => void }> = ({ photos, onSelect, onDelete }) => (
    <motion.div 
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {photos.map(photo => (
        <motion.div
          key={photo.id}
          variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
          layout
          className="relative aspect-square group overflow-hidden rounded-lg shadow-lg"
        >
          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
            <button onClick={() => onSelect(photo)} className="text-white text-sm text-center truncate">{photo.name}</button>
          </div>
          <button 
            onClick={() => onDelete(photo.id)}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </motion.div>
);

const PhotoModal: React.FC<{ photo: Photo | null, onClose: () => void }> = ({ photo, onClose }) => (
    <AnimatePresence>
        {photo && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden"
                >
                    <img src={photo.url} alt={photo.name} className="w-auto h-auto max-w-full max-h-[90vh] object-contain" />
                    <p className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-center">{photo.name}</p>
                     <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const PhotosPage: React.FC = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [newCategory, setNewCategory] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadCategory, setUploadCategory] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const fetchPhotos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPhotos();
            setPhotos(data);
        } catch (error) {
            toast.error("Failed to load photos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(photos.map(p => p.category)))], [photos]);

    const filteredPhotos = useMemo(() => 
        selectedCategory === 'All' ? photos : photos.filter(p => p.category === selectedCategory),
        [photos, selectedCategory]
    );

    const handleFileUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            toast.error("Please select files to upload.");
            return;
        }
        if (!uploadCategory.trim()) {
            toast.error("Please enter a category name.");
            return;
        }

        setIsUploading(true);
        toast.loading('Uploading photos...', { id: 'upload' });
        
        try {
            await uploadPhotos(selectedFiles, uploadCategory.trim());
            toast.success('Photos uploaded successfully!', { id: 'upload' });
            setSelectedFiles(null);
            setUploadCategory('');
            document.getElementById('file-input')?.setAttribute('value', '');
            await fetchPhotos(); // Refresh photos list
        } catch (error) {
            toast.error('Upload failed. Please try again.', { id: 'upload' });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            try {
                await deletePhoto(id);
                toast.success('Photo deleted.');
                setPhotos(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                toast.error('Failed to delete photo.');
            }
        }
    };

    return (
        <div>
            <h1 className="font-serif text-4xl mb-6">Our Photos</h1>

            {/* Upload Section */}
            <div className="bg-white/10 p-6 rounded-lg mb-8 border border-white/20">
                <h2 className="text-2xl font-serif mb-4">Add New Memories</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label htmlFor="file-input" className="w-full flex items-center justify-center gap-2 h-12 px-4 rounded-md border-2 border-dashed border-white/50 cursor-pointer hover:bg-white/10 transition">
                            <UploadIcon className="w-6 h-6" />
                            <span>{selectedFiles ? `${selectedFiles.length} file(s) selected` : 'Choose photos'}</span>
                        </label>
                        <input id="file-input" type="file" multiple accept="image/*" onChange={(e) => setSelectedFiles(e.target.files)} className="hidden"/>
                    </div>
                    <input 
                        type="text"
                        placeholder="New category name"
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value)}
                        className="h-12 bg-white/10 border border-white/20 rounded-md px-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <button onClick={handleFileUpload} disabled={isUploading} className="h-12 w-full md:w-auto px-6 bg-red-500 rounded-md font-semibold text-white transition-all hover:bg-red-600 disabled:bg-red-500/50">
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? 'bg-red-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Photo Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredPhotos.length > 0 ? (
                <PhotoGrid photos={filteredPhotos} onSelect={setSelectedPhoto} onDelete={handleDelete} />
            ) : (
                <p className="text-center text-white/70 py-10">No photos found in this category. Time to make some memories!</p>
            )}

            <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
};

export default PhotosPage;
