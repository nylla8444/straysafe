'use client';

import { useState } from 'react';

export default function InventoryModal({ isOpen, onClose, onSave, item, title, categories }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || 'pet_food',
        subcategory: item?.subcategory || '',
        quantity: item?.quantity || 0,
        unit: item?.unit || 'pcs',
        minimumStockLevel: item?.minimumStockLevel || 5,
        source: item?.source || 'purchased',
        sourceDonation: item?.sourceDonation || null,
        cost: item?.cost || 0,
        expiryDate: item?.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
        location: item?.location || 'Main Storage',
        notes: item?.notes || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (formData.quantity < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        if (formData.minimumStockLevel < 0) {
            newErrors.minimumStockLevel = 'Minimum stock level cannot be negative';
        }

        if (formData.cost < 0) {
            newErrors.cost = 'Cost cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Format data properly for the API
            let dataToSave = { ...formData };
            
            // Handle expiry date formatting properly
            if (dataToSave.expiryDate) {
                // Ensure proper date format for backend
                dataToSave.expiryDate = new Date(dataToSave.expiryDate).toISOString();
            } else {
                // If empty string, set to null to avoid validation errors
                dataToSave.expiryDate = null;
            }
            
            // Ensure numbers are properly typed
            dataToSave.quantity = Number(dataToSave.quantity);
            dataToSave.minimumStockLevel = Number(dataToSave.minimumStockLevel);
            dataToSave.cost = Number(dataToSave.cost);
            
            // If editing, include the original item ID
            if (item && item._id) {
                dataToSave._id = item._id;
            }

            console.log('Saving item with data:', dataToSave);
            
            await onSave(dataToSave);
        } catch (error) {
            console.error('Error saving item:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            {/* Item Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300' : ''}`}
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category*
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    required
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            <div>
                                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="subcategory"
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity*
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.quantity ? 'border-red-300' : ''}`}
                                    required
                                />
                                {errors.quantity && (
                                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                                )}
                            </div>

                            {/* Unit */}
                            <div>
                                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit*
                                </label>
                                <input
                                    type="text"
                                    id="unit"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="pcs, kg, liters, etc."
                                    required
                                />
                            </div>

                            {/* Minimum Stock Level */}
                            <div>
                                <label htmlFor="minimumStockLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Stock Level
                                </label>
                                <input
                                    type="number"
                                    id="minimumStockLevel"
                                    name="minimumStockLevel"
                                    value={formData.minimumStockLevel}
                                    onChange={handleInputChange}
                                    min="0"
                                    className={`shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.minimumStockLevel ? 'border-red-300' : ''}`}
                                />
                                {errors.minimumStockLevel && (
                                    <p className="mt-1 text-sm text-red-600">{errors.minimumStockLevel}</p>
                                )}
                            </div>

                            {/* Source */}
                            <div>
                                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                                    Source
                                </label>
                                <select
                                    id="source"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                    <option value="purchased">Purchased</option>
                                    <option value="donated">Donated</option>
                                    <option value="sponsored">Sponsored</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Cost */}
                            <div>
                                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cost
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">₱</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="cost"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className={`pl-8 shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.cost ? 'border-red-300' : ''}`}
                                    />
                                </div>
                                {errors.cost && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                                )}
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date (if applicable)
                                </label>
                                <input
                                    type="date"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={formData.expiryDate || ''}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Storage Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Main Storage, Shelf A, etc."
                                />
                            </div>

                            {/* Notes */}
                            <div className="sm:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Additional details about this item..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (item ? 'Update' : 'Add Item')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}