'use client';

import { useState } from 'react';

export default function FilterPanel({ 
    filters,
    onFilterChange,
    onReset,
    totalCount,
    filteredCount,
    speciesOptions = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'other'],
    genderOptions = ['male', 'female', 'unknown'],
    statusOptions = ['available', 'rehabilitating', 'adopted'],
    tagOptions = ['vaccinated', 'neutered', 'house-trained', 'special-needs', 'kid-friendly', 'senior', 'good-with-cats', 'good-with-dogs']
}) {
    const [showFilters, setShowFilters] = useState(false);

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

    return (
        <>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={toggleFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters {filteredCount < totalCount && `(${filteredCount})`}
                </button>
            </div>

            {showFilters && (
                <div className="bg-white rounded-lg shadow p-4 mb-6 transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Species filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                            <select 
                                value={filters.species} 
                                onChange={(e) => handleFilterChange('species', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Any Status</option>
                                {statusOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Price range filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceRange.min}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceRange.max}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Tags filter */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {tagOptions.map(tag => (
                                <label key={tag} className="inline-flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={filters.tags.includes(tag)} 
                                        onChange={() => handleFilterChange('tags', tag)}
                                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Reset button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}