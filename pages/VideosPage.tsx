
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Video } from '../types';
import { getVideos, uploadVideos, deleteVideo } from '../services/api';
import { UploadIcon, CloseIcon, VideoIcon as PlayIcon } from '../components/icons';

const VideoGrid: React.FC<{ videos: Video[], onSelect: (video: Video) => void, onDelete: (id: string) => void }> = ({ videos, onSelect, onDelete }) => (
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {videos.map(video => (
        <motion.div
          key={video.id}
          variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
          layout
          className="relative aspect-video group overflow-hidden rounded-lg shadow-lg bg-black"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center p-2 z-10">
            <button onClick={() => onSelect(video)} className="text-white text-lg text-center flex flex-col items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="w-12 h-12"/>
                <span className="truncate">{video.name}</span>
            </button>
          </div>
          <button 
            onClick={() => onDelete(video.id)}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors z-20"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </motion.div>
);

const VideoModal: React.FC<{ video: Video | null, onClose: () => void }> = ({ video, onClose }) => (
    <AnimatePresence>
        {video && (
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
                    className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-black"
                >
                    <video src={video.url} controls autoPlay className="w-full h-full" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const VideosPage: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadCategory, setUploadCategory] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getVideos();
            setVideos(data);
        } catch (error) {
            toast.error("Failed to load videos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const categories = useMemo(() => ['All', ...Array.from(new Set(videos.map(p => p.category)))], [videos]);

    const filteredVideos = useMemo(() => 
        selectedCategory === 'All' ? videos : videos.filter(p => p.category === selectedCategory),
        [videos, selectedCategory]
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
        toast.loading('Uploading videos...', { id: 'upload-video' });
        
        try {
            await uploadVideos(selectedFiles, uploadCategory.trim());
            toast.success('Videos uploaded successfully!', { id: 'upload-video' });
            setSelectedFiles(null);
            setUploadCategory('');
            document.getElementById('video-file-input')?.setAttribute('value', '');
            await fetchVideos(); 
        } catch (error) {
            toast.error('Upload failed. Please try again.', { id: 'upload-video' });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await deleteVideo(id);
                toast.success('Video deleted.');
                setVideos(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                toast.error('Failed to delete video.');
            }
        }
    };

    return (
        <div>
            <h1 className="font-serif text-4xl mb-6">Our Videos</h1>

            <div className="bg-white/10 p-6 rounded-lg mb-8 border border-white/20">
                <h2 className="text-2xl font-serif mb-4">Add New Moments</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label htmlFor="video-file-input" className="w-full flex items-center justify-center gap-2 h-12 px-4 rounded-md border-2 border-dashed border-white/50 cursor-pointer hover:bg-white/10 transition">
                            <UploadIcon className="w-6 h-6" />
                            <span>{selectedFiles ? `${selectedFiles.length} file(s) selected` : 'Choose videos'}</span>
                        </label>
                        <input id="video-file-input" type="file" multiple accept="video/*" onChange={(e) => setSelectedFiles(e.target.files)} className="hidden"/>
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

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredVideos.length > 0 ? (
                <VideoGrid videos={filteredVideos} onSelect={setSelectedVideo} onDelete={handleDelete} />
            ) : (
                <p className="text-center text-white/70 py-10">No videos found. Let's record our adventures!</p>
            )}

            <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        </div>
    );
};

export default VideosPage;
