
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Letter } from '../types';
import { getLetters, createLetter, updateLetter, deleteLetter } from '../services/api';
import { CloseIcon } from '../components/icons';

const LetterEditorModal: React.FC<{
    letter: Partial<Letter> | null;
    onClose: () => void;
    onSave: (letter: Partial<Letter>) => Promise<void>;
}> = ({ letter, onClose, onSave }) => {
    const [title, setTitle] = useState(letter?.title || '');
    const [content, setContent] = useState(letter?.content || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Title and content cannot be empty.");
            return;
        }
        setIsSaving(true);
        await onSave({ ...letter, title, content });
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {letter && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-gray-800/50 border border-white/20 backdrop-blur-lg rounded-lg p-6 w-full max-w-2xl text-white flex flex-col gap-4 max-h-[90vh]"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="font-serif text-2xl">{letter.id ? 'Edit Letter' : 'New Letter'}</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                                <CloseIcon className="w-6 h-6"/>
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-white/10 rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <textarea
                            placeholder="Pour your heart out..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full flex-grow bg-white/10 rounded-md p-3 resize-none h-64 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <button onClick={handleSave} disabled={isSaving} className="self-end h-12 w-32 bg-red-500 rounded-md font-semibold text-white transition-all hover:bg-red-600 disabled:bg-red-500/50">
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const LettersPage: React.FC = () => {
    const [letters, setLetters] = useState<Letter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLetter, setEditingLetter] = useState<Partial<Letter> | null>(null);

    const fetchLetters = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getLetters();
            setLetters(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            toast.error("Failed to load letters.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLetters();
    }, [fetchLetters]);

    const handleSave = async (letter: Partial<Letter>) => {
        try {
            if (letter.id) {
                await updateLetter(letter.id, letter);
                toast.success("Letter updated!");
            } else {
                await createLetter(letter);
                toast.success("Letter created!");
            }
            setEditingLetter(null);
            await fetchLetters();
        } catch (error) {
            toast.error("Failed to save letter.");
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this letter forever?")) {
            try {
                await deleteLetter(id);
                toast.success("Letter deleted.");
                await fetchLetters();
            } catch (error) {
                toast.error("Failed to delete letter.");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-4xl">Our Letters</h1>
                <button 
                    onClick={() => setEditingLetter({})} 
                    className="h-12 px-6 bg-red-500 rounded-md font-semibold text-white transition-all hover:bg-red-600"
                >
                    Write New Letter
                </button>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : letters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {letters.map(letter => (
                        <motion.div 
                            key={letter.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/10 border border-white/20 p-6 rounded-lg flex flex-col"
                        >
                            <h3 className="font-serif text-2xl mb-2 truncate">{letter.title}</h3>
                            <p className="text-sm text-white/60 mb-4">
                                {new Date(letter.updatedAt).toLocaleString()}
                            </p>
                            <p className="flex-grow text-white/80 line-clamp-4">{letter.content}</p>
                            <div className="flex gap-2 mt-6 self-end">
                                <button onClick={() => setEditingLetter(letter)} className="px-4 py-2 text-sm bg-white/20 rounded-md hover:bg-white/30 transition">Edit</button>
                                <button onClick={() => handleDelete(letter.id)} className="px-4 py-2 text-sm bg-red-500/50 rounded-md hover:bg-red-500/70 transition">Delete</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-white/70 mb-4">No letters yet.</p>
                    <p className="text-white/50">Why not write the first one?</p>
                </div>
            )}

            <LetterEditorModal letter={editingLetter} onClose={() => setEditingLetter(null)} onSave={handleSave} />
        </div>
    );
};

export default LettersPage;
