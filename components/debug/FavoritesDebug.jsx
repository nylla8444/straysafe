'use client';

import { useFavorites } from '../../context/FavoritesContext';
import { useState } from 'react';

export default function FavoritesDebug() {
    const {
        favorites,
        favoritedPetIds,
        isLoading,
        error,
        refreshFavorites
    } = useFavorites();

    const [isOpen, setIsOpen] = useState(false);

    if (process.env.NODE_ENV === 'production') {
        return null; // Don't show in production
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg hover:bg-gray-700 text-xs"
            >
                {isOpen ? 'Hide' : 'Debug'} Favorites
            </button>

            {isOpen && (
                <div className="bg-white border border-gray-300 rounded-md shadow-xl p-3 mt-2 w-80 max-h-96 overflow-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-sm">Favorites Debug</h3>
                        <button
                            onClick={() => refreshFavorites()}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="text-xs space-y-2">
                        <div>
                            <span className="font-semibold">Status:</span>
                            {isLoading ?
                                <span className="text-amber-500"> Loading...</span> :
                                <span className="text-green-500"> Ready</span>
                            }
                        </div>

                        {error && (
                            <div className="text-red-500">Error: {error}</div>
                        )}

                        <div>
                            <span className="font-semibold">Favorite IDs:</span> {favoritedPetIds.length}
                        </div>

                        <div>
                            <span className="font-semibold">Full Favorites:</span> {favorites.length}
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                            <div className="font-semibold mb-1">Pet IDs:</div>
                            <div className="max-h-24 overflow-y-auto bg-gray-50 p-1 rounded">
                                {favoritedPetIds.length > 0 ?
                                    favoritedPetIds.map((id, index) => (
                                        <div key={id} className="truncate">
                                            {index + 1}. {id}
                                        </div>
                                    )) :
                                    <div className="italic text-gray-400">No favorites</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}