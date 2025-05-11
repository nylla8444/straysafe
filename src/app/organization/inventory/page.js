'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import InventoryModal from '../../../components/inventory/InventoryModal';
import DeleteConfirmationModal from '../../../components/inventory/DeleteConfirmationModal';
import CashDonationComponent from '../../../components/donations/CashDonationComponent';
import StatsDashboard from '../../../components/dashboard/StatsDashboard';

export default function InventoryManagementPage() {
    const { user, loading, isAuthenticated, isOrganization } = useAuth();
    const router = useRouter();

    // State for inventory items
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // State for modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // State for active tab
    const [activeTab, setActiveTab] = useState('inventory');

    // State for refresh button
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Categories for filter dropdown
    const categories = [
        { value: 'pet_food', label: 'Pet Food' },
        { value: 'medical_supply', label: 'Medical Supplies' },
        { value: 'medication', label: 'Medication' },
        { value: 'cleaning_supply', label: 'Cleaning Supplies' },
        { value: 'shelter_equipment', label: 'Shelter Equipment' },
        { value: 'pet_accessory', label: 'Pet Accessories' },
        { value: 'office_supply', label: 'Office Supplies' },
        { value: 'donation_item', label: 'Donated Items' },
        { value: 'other', label: 'Other Items' },
    ];

    // Auth check - redirect if not authorized
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (user && !isOrganization()) {
                router.push('/profile');
                return;
            }

            if (user && !user.isVerified) {
                router.push('/organization');
                return;
            }

            // User is authenticated and verified, fetch inventory
            fetchInventory();
        }
    }, [loading, isAuthenticated, user, router, isOrganization]);

    // Fetch inventory items from API
    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/inventory');

            if (response.data.success) {
                setItems(response.data.items || []);
            } else {
                setError('Failed to load inventory items');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('Error loading inventory. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh inventory data
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            await fetchInventory();
            setNotification({
                show: true,
                type: 'success',
                message: 'Inventory data refreshed!'
            });

            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error('Error refreshing inventory:', error);
            setNotification({
                show: true,
                type: 'error',
                message: 'Failed to refresh inventory data'
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // Filter items based on search term and category
    const filteredItems = items.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Handle add new item
    const handleAddItem = async (newItem) => {
        try {
            const response = await axios.post('/api/inventory', newItem);

            if (response.data.success) {
                setItems([...items, response.data.item]);
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Item added successfully!'
                });
                setIsAddModalOpen(false);

                // Hide notification after 3 seconds
                setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 3000);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to add item'
                });
            }
        } catch (error) {
            console.error('Error adding inventory item:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error adding item'
            });
        }
    };

    // Handle update item
    const handleUpdateItem = async (updatedItemData) => {
        try {
            console.log('Updating item with data:', updatedItemData);

            const response = await axios.put(`/api/inventory/${updatedItemData._id}`, updatedItemData);

            if (response.data.success) {
                // Create a new array with the updated item
                const updatedItems = items.map(item =>
                    item._id === updatedItemData._id ? response.data.item : item
                );

                // Update state with new array to trigger re-render
                setItems(updatedItems);

                // Force a re-fetch to ensure data consistency
                fetchInventory();

                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Item updated successfully!'
                });

                setIsEditModalOpen(false);
                setCurrentItem(null);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to update item'
                });
            }
        } catch (error) {
            console.error('Error updating item:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error updating item'
            });
        }
    };

    // Handle delete item
    const handleDeleteItem = async (itemId) => {
        try {
            const response = await axios.delete(`/api/inventory/${itemId}`);

            if (response.data.success) {
                setItems(items.filter(item => item._id !== itemId));
                setNotification({
                    show: true,
                    type: 'success',
                    message: 'Item deleted successfully!'
                });
                setIsDeleteModalOpen(false);
                setCurrentItem(null);

                setTimeout(() => {
                    setNotification({ show: false, type: '', message: '' });
                }, 3000);
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: response.data.message || 'Failed to delete item'
                });
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Error deleting item'
            });
        }
    };

    // Loading state
    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/organization" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold">Inventory Management</h1>
                    {/* Add refresh button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="ml-3 p-2 rounded-full hover:bg-amber-100 text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                        aria-label="Refresh inventory data"
                        title="Refresh inventory data"
                    >
                        <svg
                            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Item
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'inventory'
                        ? 'border-b-2 border-amber-500 text-amber-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Inventory Items
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'donations'
                        ? 'border-b-2 border-amber-500 text-amber-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cash Donations
                </button>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'dashboard'
                        ? 'border-b-2 border-amber-500 text-amber-600'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Dashboard
                </button>
            </div>

            {/* Conditional rendering based on activeTab */}
            {activeTab === 'inventory' && (
                <div>
                    {/* Notification message */}
                    <AnimatePresence>
                        {notification.show && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`p-4 rounded-md mb-6 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                                    'bg-red-50 text-red-800 border border-red-200'
                                    }`}
                            >
                                {notification.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filters and search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Search items..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-amber-500 focus:border-amber-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Category filter */}
                            <div>
                                <label htmlFor="category" className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="border border-gray-300 rounded-md w-full py-2 px-3 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status filter */}
                            <div>
                                <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="border border-gray-300 rounded-md w-full py-2 px-3 focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="low_stock">Low Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 border border-red-200">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* No items message */}
                    {!isLoading && items.length === 0 && (
                        <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4M4 7l8 4" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No inventory items yet</h3>
                            <p className="mt-2 text-gray-600">
                                Get started by adding your first inventory item.
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-4 bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Add First Item
                            </button>
                        </div>
                    )}

                    {/* Inventory table */}
                    {items.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredItems.map(item => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">{item.itemId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {categories.find(cat => cat.value === item.category)?.label || item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.status === 'in_stock' ? 'In Stock' :
                                                        item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.source === 'purchased' ? 'Purchased' :
                                                    item.source === 'donated' ? 'Donated' :
                                                        item.source === 'sponsored' ? 'Sponsored' : 'Other'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setCurrentItem(item);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCurrentItem(item);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Filtered results message */}
                    {items.length > 0 && filteredItems.length === 0 && (
                        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200 mt-4">
                            <p className="text-gray-600">No items match your current filters.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                    setSelectedStatus('all');
                                }}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                    {/* Add Item Modal */}
                    {isAddModalOpen && (
                        <InventoryModal
                            isOpen={isAddModalOpen}
                            onClose={() => setIsAddModalOpen(false)}
                            onSave={handleAddItem}
                            title="Add New Inventory Item"
                            categories={categories}
                        />
                    )}

                    {/* Edit Item Modal */}
                    {isEditModalOpen && currentItem && (
                        <InventoryModal
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setCurrentItem(null);
                            }}
                            onSave={handleUpdateItem}
                            item={currentItem}
                            title="Edit Inventory Item"
                            categories={categories}
                        />
                    )}

                    {/* Delete Confirmation Modal */}
                    {isDeleteModalOpen && currentItem && (
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setCurrentItem(null);
                            }}
                            onDelete={() => handleDeleteItem(currentItem._id)}
                            itemName={currentItem.name}
                        />
                    )}
                </div>
            )}

            {activeTab === 'donations' && (
                <CashDonationComponent />
            )}

            {activeTab === 'dashboard' && (
                <StatsDashboard />
            )}
        </div>
    );
}