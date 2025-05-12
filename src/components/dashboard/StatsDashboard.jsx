'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useSwipeable } from 'react-swipeable';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '../../components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from '../../components/ui/chart';
import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';

export default function StatsDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Detect mobile screens
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile screen on mount and resize
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // Function to determine interval for X-axis ticks
    const getXAxisInterval = () => {
        const width = window.innerWidth;
        if (width < 400) return 2;  // Show every third label
        if (width < 768) return 1;  // Show every other label
        return 0;  // Show all labels
    };

    const getChartHeight = () => {
        if (window.innerWidth < 400) return 250;
        if (window.innerWidth < 768) return 280;
        return 300;
    };


    // Stats states
    const [inventoryStats, setInventoryStats] = useState({
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0
    });
    const [categoryData, setCategoryData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [donationStats, setDonationStats] = useState({
        count: 0,
        totalAmount: 0,
        averageAmount: 0
    });
    const [monthlyDonations, setMonthlyDonations] = useState([]);
    const [purposeData, setPurposeData] = useState([]);

    // Chart configs
    const categoryColors = {
        pet_food: '#FF9800',
        medical_supply: '#03A9F4',
        medication: '#9C27B0',
        cleaning_supply: '#8BC34A',
        shelter_equipment: '#795548',
        pet_accessory: '#009688',
        office_supply: '#607D8B',
        donation_item: '#3F51B5',
        other: '#9E9E9E'
    };

    const statusColors = {
        in_stock: '#4CAF50',
        low_stock: '#FF9800',
        out_of_stock: '#F44336'
    };

    const purposeColors = {
        general: '#2196F3',
        medical: '#4CAF50',
        food: '#FF9800',
        shelter: '#9C27B0',
        rescue: '#E91E63',
        other: '#607D8B'
    };

    const [activeChartIndex, setActiveChartIndex] = useState(0);

    // Fetch dashboard data
    useEffect(() => {
        async function fetchDashboardData() {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);

                // Fetch inventory statistics
                const inventoryResponse = await axios.get('/api/inventory/stats');
                if (inventoryResponse.data.success) {
                    const { summary, categoryDistribution, statusDistribution } = inventoryResponse.data;

                    setInventoryStats({
                        totalItems: summary.totalItems || 0,
                        totalValue: summary.totalValue || 0,
                        lowStockCount: summary.lowStockCount || 0,
                        outOfStockCount: summary.outOfStockCount || 0
                    });

                    setCategoryData(categoryDistribution.map(item => ({
                        name: item.category,
                        value: item.count,
                        label: getCategoryLabel(item.category)
                    })));

                    setStatusData(statusDistribution.map(item => ({
                        name: item.status,
                        value: item.count,
                        label: getStatusLabel(item.status),
                        color: statusColors[item.status] || '#999'
                    })));
                }

                // Fetch donation statistics
                const donationResponse = await axios.get('/api/cash-donation/stats');
                if (donationResponse.data.success) {
                    const { summary, monthlyData, purposeDistribution } = donationResponse.data;

                    setDonationStats({
                        count: summary.count || 0,
                        totalAmount: summary.totalAmount || 0,
                        averageAmount: summary.averageAmount || 0
                    });

                    setMonthlyDonations(monthlyData.map(item => ({
                        name: formatMonthYear(item.month),
                        amount: item.amount
                    })));

                    setPurposeData(purposeDistribution.map(item => ({
                        name: item.purpose,
                        value: item.amount,
                        label: getPurposeLabel(item.purpose),
                        color: purposeColors[item.purpose] || '#999'
                    })));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [user]);

    // Helper functions for labels
    function getCategoryLabel(category) {
        const labels = {
            pet_food: 'Pet Food',
            medical_supply: 'Medical Supplies',
            medication: 'Medication',
            cleaning_supply: 'Cleaning Supplies',
            shelter_equipment: 'Shelter Equipment',
            pet_accessory: 'Pet Accessories',
            office_supply: 'Office Supplies',
            donation_item: 'Donated Items',
            other: 'Other'
        };
        return labels[category] || category;
    }

    function getStatusLabel(status) {
        const labels = {
            in_stock: 'In Stock',
            low_stock: 'Low Stock',
            out_of_stock: 'Out of Stock'
        };
        return labels[status] || status;
    }

    function getPurposeLabel(purpose) {
        const labels = {
            general: 'General',
            medical: 'Medical Care',
            food: 'Food & Supplies',
            shelter: 'Shelter',
            rescue: 'Rescue Operations',
            other: 'Other'
        };
        return labels[purpose] || purpose;
    }

    function formatMonthYear(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('default', { month: 'short', year: '2-digit' });
        } catch {
            return dateString;
        }
    }



    // Config objects for charts
    const categoryChartConfig = categoryData.reduce((config, item) => {
        config[item.name] = {
            color: categoryColors[item.name] || '#999',
            label: item.label
        };
        return config;
    }, {});

    const statusChartConfig = statusData.reduce((config, item) => {
        config[item.name] = {
            color: statusColors[item.name] || '#999',
            label: item.label
        };
        return config;
    }, {});

    const purposeChartConfig = purposeData.reduce((config, item) => {
        config[item.name] = {
            color: purposeColors[item.name] || '#999',
            label: item.label
        };
        return config;
    }, {});

    const donationChartConfig = {
        amount: {
            color: '#F59E0B', // amber
            label: 'Donation Amount'
        }
    };

    const chartSections = [
        {
            title: "Inventory Status",
            description: "Distribution of items by stock status",
            component: (
                <ChartContainer config={statusChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="99%" height="99%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="50%"
                                label={({ name, percent }) =>
                                    isMobile && percent < 0.1
                                        ? ''
                                        : isMobile
                                            ? `${(percent * 100).toFixed(0)}%`
                                            : `${getPurposeLabel(name)}: ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend
                                verticalAlign="bottom"
                                align="center"
                                layout="horizontal"
                                content={<ChartLegendContent />}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        },
        {
            title: "Monthly Donations",
            description: "Donation amount by month",
            component: (
                <ChartContainer config={donationChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart
                            data={monthlyDonations}
                            accessibilityLayer
                            margin={{ top: 10, right: 15, bottom: 10, left: 0 }}
                            barCategoryGap="10%"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                                interval={1} // Show every other tick on mobile
                            />
                            <YAxis
                                width={45}
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `₱${(value / 1000000).toFixed(0)}M`;
                                    } else if (value >= 1000) {
                                        return `₱${(value / 1000).toFixed(0)}k`;
                                    }
                                    return `₱${value}`;
                                }}
                                tick={{ fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                                tickCount={4}
                            />
                            <Bar
                                dataKey="amount"
                                fill="var(--color-amount)"
                                radius={[4, 4, 0, 0]}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        },
        {
            title: "Inventory Categories",
            description: "Distribution of items by category",
            component: (
                <ChartContainer config={categoryChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="99%" height="99%">
                        <BarChart
                            data={categoryData}
                            layout="vertical"
                            accessibilityLayer
                            margin={{ top: 10, right: 15, bottom: 10, left: 0 }}
                            barCategoryGap="10%"
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickFormatter={(value) => getCategoryLabel(value)}
                                width={70}
                                tick={{ fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#999'} />
                                ))}
                            </Bar>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        },
        {
            title: "Donation Purposes",
            description: "How donations are allocated",
            component: (
                <ChartContainer config={purposeChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="99%" height="99%">
                        <PieChart>
                            <Pie
                                data={purposeData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="50%"
                                label={({ name, percent }) =>
                                    isMobile && percent < 0.1
                                        ? ''
                                        : isMobile
                                            ? `${(percent * 100).toFixed(0)}%`
                                            : `${getPurposeLabel(name)}: ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {purposeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend
                                verticalAlign="bottom"
                                align="center"
                                layout="horizontal"
                                content={<ChartLegendContent />}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        }
    ];

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            if (activeChartIndex < chartSections.length - 1) {
                setActiveChartIndex(activeChartIndex + 1);
            }
        },
        onSwipedRight: () => {
            if (activeChartIndex > 0) {
                setActiveChartIndex(activeChartIndex - 1);
            }
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: false
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 border border-red-200">
                <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Mobile view with swipeable charts
    if (isMobile) {
        return (
            <div className="space-y-4">
                {/* Summary Cards (2x2 grid on mobile) */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Total Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{inventoryStats.totalItems}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="inline-block px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 mr-1">
                                    {inventoryStats.lowStockCount} Low
                                </span>
                                <span className="inline-block px-1 py-0.5 rounded-full bg-red-100 text-red-700">
                                    {inventoryStats.outOfStockCount} Out
                                </span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Inventory Value</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">₱{(inventoryStats.totalValue / 1000).toFixed(1)}k</div>
                            <p className="text-xs text-muted-foreground mt-1">Total value</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Donations</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{donationStats.count}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total received</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Total Amount</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">₱{(donationStats.totalAmount / 1000).toFixed(1)}k</div>
                            <p className="text-xs text-muted-foreground mt-1">Avg: ₱{(donationStats.averageAmount / 1000).toFixed(1)}k</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="text-lg font-semibold">{chartSections[activeChartIndex].title}</h3>
                            <p className="text-xs text-gray-500">{chartSections[activeChartIndex].description}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                            {activeChartIndex + 1}/{chartSections.length}
                        </div>
                    </div>

                    {/* Simplified chart container */}
                    <Card>
                        <CardContent
                            className="p-2 h-[300px]"
                            {...swipeHandlers}
                        >
                            {/* Chart uses full available space */}
                            {chartSections[activeChartIndex].component}
                        </CardContent>
                    </Card>

                    {/* Navigation dots */}
                    <div className="flex justify-center mt-4 gap-2">
                        {chartSections.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveChartIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === activeChartIndex
                                    ? 'bg-amber-500'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`View ${chartSections[index].title} chart`}
                            />
                        ))}
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-2">
                        Swipe left or right to view more charts
                    </p>
                </div>
            </div>
        );
    }

    // Desktop view stays the same
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{inventoryStats.totalItems}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mr-1">
                                {inventoryStats.lowStockCount} Low Stock
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                {inventoryStats.outOfStockCount} Out of Stock
                            </span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₱{inventoryStats.totalValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2">Total value of all items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{donationStats.count}</div>
                        <p className="text-xs text-muted-foreground mt-2">Number of donations received</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₱{donationStats.totalAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Avg: ₱{donationStats.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Status</CardTitle>
                        <CardDescription>Distribution of items by stock status</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
                        <ChartContainer config={statusChartConfig} className={`w-full h-full`}>
                            <ResponsiveContainer width="99%" height="99%">
                                <PieChart >
                                    <Pie
                                        data={statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="50%"
                                        label={({ name, percent }) => `${getStatusLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend
                                        verticalAlign="bottom"
                                        content={<ChartLegendContent />}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Monthly Donations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Donations</CardTitle>
                        <CardDescription>Donation amount by month</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
                        <ChartContainer config={donationChartConfig} className="w-full h-full">
                            <ResponsiveContainer width="99%" height="99%">
                                <BarChart
                                    data={monthlyDonations}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                    barCategoryGap="10%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        interval={getXAxisInterval()}

                                    />
                                    <YAxis
                                        width={60}
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
                                            if (value >= 1000) return `₱${(value / 1000).toFixed(0)}k`;
                                            return `₱${value}`;
                                        }}
                                        tick={{ fontSize: 11 }}
                                        tickCount={5}

                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="var(--color-amount)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Categories</CardTitle>
                        <CardDescription>Distribution of items by category</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
                        <ChartContainer config={categoryChartConfig} className="w-full h-full">
                            <ResponsiveContainer width="99%" height="99%">
                                <BarChart
                                    data={categoryData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                    barCategoryGap="30%"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis
                                        type="number"
                                        tickLine={false}
                                        tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickFormatter={(value) => {
                                            if (window.innerWidth < 992) {
                                                const shortLabels = {
                                                    pet_food: 'Pet Food',
                                                    medical_supply: 'Med Supplies',
                                                    medication: 'Medication',
                                                    cleaning_supply: 'Cleaning',
                                                    shelter_equipment: 'Shelter Eq',
                                                    pet_accessory: 'Pet Acc',
                                                    office_supply: 'Office',
                                                    donation_item: 'Donations',
                                                    other: 'Other'
                                                };
                                                return shortLabels[value] || getCategoryLabel(value);
                                            }
                                            return getCategoryLabel(value);
                                        }}
                                        width={90}  // Fixed width instead of complex calculation
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#999'} />
                                        ))}
                                    </Bar>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Donation Purposes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Donation Purposes</CardTitle>
                        <CardDescription>How donations are allocated</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
                        <ChartContainer config={purposeChartConfig} className="h-full w-full">
                            <ResponsiveContainer width="99%" height="99%">
                                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <Pie
                                        data={purposeData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="50%"
                                        label={({ name, percent }) => `${getStatusLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {purposeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend
                                        verticalAlign="bottom"

                                        content={<ChartLegendContent />}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}