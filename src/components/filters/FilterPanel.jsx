'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterPanel({
    filters,
    onFilterChange,
    onReset,
    totalCount,
    filteredCount,
    speciesOptions = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'other'],
    genderOptions = ['male', 'female', 'unknown'],
    statusOptions = ['available', 'rehabilitating'],
    tagOptions = ['vaccinated', 'neutered', 'house-trained', 'special-needs', 'kid-friendly', 'senior', 'good-with-cats', 'good-with-dogs'],
    showIconOnly = false // for responsive design

}) {
    const [showFilters, setShowFilters] = useState(false);
    const panelRef = useRef(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target) && showFilters) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilters]);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleFilterChange = (category, value) => {
        if (category === 'tags') {
            // Toggle tag selection
            onFilterChange('tags', value);
        } else if (category === 'priceMin') {
            onFilterChange('priceRange', { min: value, max: filters.priceRange.max });
        } else if (category === 'priceMax') {
            onFilterChange('priceRange', { min: filters.priceRange.min, max: value });
        } else {
            onFilterChange(category, value);
        }
    };

    // Applied filters count - for badge display
    const appliedFiltersCount = (
        (filters.species ? 1 : 0) +
        (filters.gender ? 1 : 0) +
        (filters.status ? 1 : 0) +
        (filters.tags?.length || 0) +
        (filters.priceRange.min ? 1 : 0) +
        (filters.priceRange.max ? 1 : 0)
    );

    return (
        <div className="relative z-30">
            {/* Filter toggle button with improved UI */}
            <button
                onClick={toggleFilters}
                className={`px-3 sm:px-4 py-2 rounded-md flex items-center justify-center transition-all duration-200 ${showFilters
                    ? 'bg-orange-700 text-white shadow-lg'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                aria-expanded={showFilters}
                aria-controls="filter-panel"
            >
                <svg
                    className={`w-5 h-5 ${!showIconOnly ? 'mr-2 sm:mr-2' : ''} transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>

                {/* Text that only shows on larger screens if showIconOnly is true */}
                <span className={showIconOnly ? "hidden sm:inline" : ""}>Filters</span>

                {/* Badge showing active filters */}
                {appliedFiltersCount > 0 && (
                    <span className="ml-2 bg-white text-orange-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {appliedFiltersCount}
                    </span>
                )}

                {/* Badge for filtered results */}
                {filteredCount < totalCount && (
                    <span className="ml-2 text-xs">
                        ({filteredCount}/{totalCount})
                    </span>
                )}
            </button>

            {/* Filter panel overlay */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`${showFilters ? 'block' : 'hidden'} absolute right-0 sm:right-0 mt-2 w-[280px] sm:w-[400px] md:w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-40`}
                        ref={panelRef}
                        id="filter-panel"
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Species filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                    <select
                                        value={filters.species}
                                        onChange={(e) => handleFilterChange('species', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Any Species</option>
                                        {speciesOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Gender filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={filters.gender}
                                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Any Gender</option>
                                        {genderOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Any Status</option>
                                        {statusOptions.map(option => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Price range filter */}
                            <div className="mt-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                <div className="flex space-x-3 items-center">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceRange.min}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <span className="text-gray-500">to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceRange.max}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Tags filter */}
                            <div className="mt-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {tagOptions.map(tag => (
                                        <label key={tag} className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.tags.includes(tag)}
                                                onChange={() => handleFilterChange('tags', tag)}
                                                className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                                                {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Showing {filteredCount} of {totalCount} items
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            onReset();
                                            setShowFilters(false);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                    >
                                        Reset Filters
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}