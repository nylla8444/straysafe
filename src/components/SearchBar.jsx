'use client';

import { useState, useEffect, useRef } from 'react';

export default function SearchBar({
    placeholder = "Search...",
    onSearch,
    initialValue = "",
    className = "",
    onClear = null, // New prop to expose clear functionality
    ref = null // Optional ref forwarding
}) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const searchInputRef = useRef(null);

    // Handle search term changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Focus the search input when pressing '/' (only on desktop)
    useEffect(() => {
        // Skip keyboard shortcuts on touch devices
        if ('ontouchstart' in window) return;

        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Expose this function to parent components through ref if provided
    const handleClear = () => {
        setSearchTerm("");
        if (onSearch) {
            onSearch("");
        }
        searchInputRef.current?.focus();

        // Call the onClear prop if provided
        if (onClear) {
            onClear();
        }
    };

    // Expose methods via ref if provided
    useEffect(() => {
        if (ref) {
            ref.current = {
                clear: handleClear,
                focus: () => searchInputRef.current?.focus(),
                getValue: () => searchTerm,
                setValue: (value) => setSearchTerm(value)
            };
        }
    }, [ref, searchTerm]);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                {/* Fixed icon positioning */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full py-3 sm:py-2 px-3 pl-10 pr-16 sm:pr-36 text-sm border border-gray-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    placeholder={placeholder}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-3 flex items-center justify-center w-8 text-gray-500 hover:text-gray-700 z-20"
                        aria-label="Clear search"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Only show keyboard shortcut on larger screens */}
                <div className="absolute right-12 inset-y-0 hidden sm:flex items-center text-xs text-gray-400 pointer-events-none z-10">
                    <span className="hidden md:inline">Press</span> <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded mx-1">/</kbd> <span className="hidden md:inline">to search</span>
                </div>
            </div>
        </div>
    );
}