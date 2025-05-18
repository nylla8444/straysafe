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
    LineChart,
    Line
} from 'recharts';
import { format, parseISO, startOfMonth, subMonths, addMonths } from 'date-fns';

export default function RescueStatsDashboard({ cases }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [activeChartIndex, setActiveChartIndex] = useState(0);

    // Stats states
    const [statusData, setStatusData] = useState([]);
    const [animalTypeData, setAnimalTypeData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [rescueStats, setRescueStats] = useState({
        totalRescues: 0,
        ongoingCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        avgTimeToResolve: 0
    });

    // Chart colors
    const statusColors = {
        ongoing: '#FFC107', // amber
        completed: '#4CAF50', // green
        cancelled: '#9E9E9E' // gray
    };

    const animalTypeColors = {
        dog: '#2196F3', // teal
        cat: '#FF5722', // deep orange
        bird: '#8BC34A', // light green
        wildlife: '#9C27B0', // purple
        other: '#607D8B' // teal grey
    };

    // Detect mobile screens
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

    // Process data whenever cases prop changes
    useEffect(() => {
        if (!cases || cases.length === 0) return;

        processRescueData(cases);
    }, [cases]);

    // Process rescue data into chart formats
    const processRescueData = (rescueCases) => {
        try {
            setIsLoading(true);

            // Status distribution
            const statusCounts = {
                ongoing: 0,
                completed: 0,
                cancelled: 0
            };

            // Animal type distribution
            const animalTypeCounts = {};

            // Monthly trends
            const monthlyRescues = {};

            // Calculate average time to resolve (for completed cases)
            let totalResolveTime = 0;
            let completedCasesCount = 0;

            // Process each case
            rescueCases.forEach(rescueCase => {
                // Count by status
                statusCounts[rescueCase.status] = (statusCounts[rescueCase.status] || 0) + 1;

                // Count by animal type
                if (animalTypeCounts[rescueCase.animalType]) {
                    animalTypeCounts[rescueCase.animalType]++;
                } else {
                    animalTypeCounts[rescueCase.animalType] = 1;
                }

                // Group by month
                const rescueDate = new Date(rescueCase.rescueDate);
                const monthYear = format(rescueDate, 'yyyy-MM');

                if (monthlyRescues[monthYear]) {
                    monthlyRescues[monthYear]++;
                } else {
                    monthlyRescues[monthYear] = 1;
                }

                // Calculate resolve time for completed cases
                if (rescueCase.status === 'completed') {
                    const startDate = new Date(rescueCase.rescueDate);
                    const endDate = new Date(rescueCase.updatedAt);
                    const daysToResolve = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                    totalResolveTime += daysToResolve;
                    completedCasesCount++;
                }
            });

            // Ensure we have data for the last 6 months
            const monthsToShow = 6;
            const monthlyDataArray = generateMonthlyDataArray(monthlyRescues, monthsToShow);

            // Format data for charts
            setStatusData(Object.keys(statusCounts)
                .filter(status => statusCounts[status] > 0) // Only include statuses with value > 0
                .map(status => ({
                    name: status,
                    value: statusCounts[status],
                    color: statusColors[status] || '#999'
                }))
            );

            setAnimalTypeData(Object.keys(animalTypeCounts).map(type => ({
                name: type,
                value: animalTypeCounts[type],
                color: animalTypeColors[type] || '#999'
            })));

            setMonthlyData(monthlyDataArray);

            // Set overall statistics
            setRescueStats({
                totalRescues: rescueCases.length,
                ongoingCount: statusCounts.ongoing || 0,
                completedCount: statusCounts.completed || 0,
                cancelledCount: statusCounts.cancelled || 0,
                avgTimeToResolve: completedCasesCount ? Math.round(totalResolveTime / completedCasesCount) : 0
            });

        } catch (error) {
            console.error('Error processing rescue data:', error);
            setError('Failed to process rescue statistics.');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate an array with data for the last X months, filling in zeros for months with no rescues
    const generateMonthlyDataArray = (monthlyData, monthsCount = 6) => {
        const result = [];
        const today = new Date();

        // Start from X months ago
        let currentDate = subMonths(startOfMonth(today), monthsCount - 1);

        // Generate data for each month until current month
        for (let i = 0; i < monthsCount; i++) {
            const monthKey = format(currentDate, 'yyyy-MM');
            const monthLabel = format(currentDate, 'MMM yy');

            result.push({
                name: monthLabel,
                month: monthKey,
                count: monthlyData[monthKey] || 0
            });

            currentDate = addMonths(currentDate, 1);
        }

        return result;
    };

    // Helper functions for labels and formatting
    function getStatusLabel(status) {
        const labels = {
            ongoing: 'Ongoing',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return labels[status] || status;
    }

    function getAnimalTypeLabel(type) {
        const labels = {
            dog: 'Dog',
            cat: 'Cat',
            bird: 'Bird',
            wildlife: 'Wildlife',
            other: 'Other'
        };

        // Add shortened labels for mobile
        if (isMobile) {
            const shortLabels = {
                dog: 'Dog',
                cat: 'Cat',
                bird: 'Bird',
                wildlife: 'Wild',
                other: 'Other'
            };
            return shortLabels[type] || type;
        }

        return labels[type] || type;
    }

    // Function to calculate responsive pie chart radius based on container width
    const getResponsivePieRadius = () => {
        if (window.innerWidth < 360) return '40%';
        if (window.innerWidth < 768) return '50%';
        return '60%';
    };

    // Add this function to dynamically calculate chart height
    const getChartHeight = () => {
        if (window.innerWidth < 400) return 250;
        if (window.innerWidth < 768) return 280;
        return 300;
    };

    // Config objects for charts
    const statusChartConfig = statusData.reduce((config, item) => {
        config[item.name] = {
            color: item.color,
            label: getStatusLabel(item.name)
        };
        return config;
    }, {});

    const animalTypeChartConfig = animalTypeData.reduce((config, item) => {
        config[item.name] = {
            color: item.color,
            label: getAnimalTypeLabel(item.name)
        };
        return config;
    }, {});

    const trendsChartConfig = {
        count: {
            color: '#E91E63', // pink
            label: 'Rescues'
        }
    };

    // Define charts for swipeable mobile view
    const chartSections = [
        {
            title: "Rescue Status",
            description: "Distribution of rescue cases by status",
            component: (
                <ChartContainer config={statusChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={getResponsivePieRadius()}
                                // Smart label handling based on screen size AND slice size
                                label={({ name, percent }) =>
                                    isMobile && percent < 0.1
                                        ? '' // Hide labels for small slices on mobile
                                        : isMobile
                                            ? `${(percent * 100).toFixed(0)}%` // Short labels on mobile
                                            : `${getStatusLabel(name)}: ${(percent * 100).toFixed(0)}%` // Full labels on desktop
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
            title: "Animal Types",
            description: "Types of animals rescued",
            component: (
                <ChartContainer config={animalTypeChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={animalTypeData}
                            layout="vertical"
                            accessibilityLayer
                            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                            barCategoryGap={isMobile ? "10%" : "30%"}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickFormatter={(value) => getAnimalTypeLabel(value)}
                                width={55}  // Reduced width for mobile
                                tick={{ fontSize: isMobile ? 9 : 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Bar
                                dataKey="value"
                                radius={[0, 4, 4, 0]}
                            >
                                {animalTypeData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Bar>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        },
        {
            title: "Monthly Trends",
            description: "Rescue cases over time",
            component: (
                <ChartContainer config={trendsChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={monthlyData}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: isMobile ? 9 : 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: isMobile ? 9 : 12 }}
                                tickLine={false}
                                axisLine={false}
                                width={20}  // Added width constraint
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#E91E63"
                                strokeWidth={2}
                                dot={{ r: 3 }}  // Smaller dots on mobile
                                activeDot={{ r: 5 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )
        }
    ];

    // Set up swipe handlers for mobile
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
            <div className="flex justify-center items-center min-h-[30vh] sm:min-h-[60vh]">
                <div className="flex flex-col items-center px-4 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm sm:text-base text-gray-600">Processing rescue statistics...</p>
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

    // If no cases data provided
    if (!cases || cases.length === 0) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No rescue cases yet</h3>
                <p className="mt-2 text-gray-600">
                    Start adding rescue cases to see statistics here.
                </p>
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
                            <CardTitle className="text-base">Total Rescues</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{rescueStats.totalRescues}</div>
                            <p className="text-xs text-muted-foreground mt-1">Rescue cases</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Ongoing</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{rescueStats.ongoingCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Cases in progress</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Completed</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{rescueStats.completedCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardHeader className="pb-1 px-3">
                            <CardTitle className="text-base">Avg. Time</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                            <div className="text-xl font-bold">{rescueStats.avgTimeToResolve}</div>
                            <p className="text-xs text-muted-foreground mt-1">Days to complete</p>
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
                                    ? 'bg-red-500'
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

    // Desktop view
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Total Rescues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rescueStats.totalRescues}</div>
                        <p className="text-xs text-muted-foreground mt-2">Total rescue cases tracked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Ongoing Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rescueStats.ongoingCount}</div>
                        <p className="text-xs text-muted-foreground mt-2">{Math.round((rescueStats.ongoingCount / rescueStats.totalRescues) * 100)}% of total cases</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rescueStats.completedCount}</div>
                        <p className="text-xs text-muted-foreground mt-2">{Math.round((rescueStats.completedCount / rescueStats.totalRescues) * 100)}% success rate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Average Resolution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rescueStats.avgTimeToResolve} days</div>
                        <p className="text-xs text-muted-foreground mt-2">Average time to complete</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rescue Status</CardTitle>
                        <CardDescription>Distribution of rescue cases by status</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
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
                                        label={({ name, percent }) => `${getStatusLabel(name)}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Rescue cases over time</CardDescription>
                    </CardHeader>
                    <CardContent className={`h-[${getChartHeight()}px]`}>
                        <ChartContainer config={trendsChartConfig} className="h-full w-full">
                            <ResponsiveContainer width="99%" height="99%">
                                <LineChart
                                    data={monthlyData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                        padding={{ left: 10, right: 10 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        width={40}
                                        tickFormatter={(value) => value}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#E91E63"
                                        strokeWidth={2}
                                        dot={{ r: isMobile ? 3 : 4 }}
                                        activeDot={{ r: isMobile ? 5 : 6 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Animal Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Animal Types</CardTitle>
                    <CardDescription>Types of animals rescued</CardDescription>
                </CardHeader>
                <CardContent className={`h-[${getChartHeight()}px]`}>
                    <ChartContainer config={animalTypeChartConfig} className="h-full w-full">
                        <ResponsiveContainer width="99%" height="99%">
                            <BarChart
                                data={animalTypeData}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                barCategoryGap={isMobile ? "10%" : "30%"}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tickFormatter={(value) => getAnimalTypeLabel(value)}
                                    width={isMobile ? 70 : 100}
                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 4, 4, 0]}
                                >
                                    {animalTypeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Bar>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}