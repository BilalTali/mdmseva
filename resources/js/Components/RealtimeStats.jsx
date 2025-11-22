import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Receipt, Package, Activity } from 'lucide-react';
import axios from 'axios';

const RealtimeStats = ({ demoMode = true }) => {
    const [stats, setStats] = useState({
        enrolledSchools: 0,
        riceReportsGenerated: 0,
        amountReportsGenerated: 0,
        kiryanaaBills: 0,
        fuelBills: 0,
        totalStudentsServed: 0,
        activeUsers: 0,
        riceDistributed: 0
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch real-time stats from backend
    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard/stats');
            if (response.data.success) {
                setStats(response.data.data);
                setLastUpdated(new Date(response.data.data.lastUpdated));
                setIsConnected(true);
            }
        } catch (error) {
            console.error('Failed to fetch real-time stats:', error);
            setIsConnected(false);
            // Fallback to animated demo data only if still in demo mode
            if (demoMode) animateToTargetStats();
        } finally {
            setIsLoading(false);
        }
    };

    // Animate to target stats (fallback when API fails)
    const animateToTargetStats = () => {
        const targetStats = {
            enrolledSchools: 247,
            riceReportsGenerated: 1853,
            amountReportsGenerated: 1789,
            kiryanaaBills: 3421,
            fuelBills: 2156,
            totalStudentsServed: 89543,
            activeUsers: 189,
            riceDistributed: 45678
        };

        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            setStats({
                enrolledSchools: Math.floor(targetStats.enrolledSchools * progress),
                riceReportsGenerated: Math.floor(targetStats.riceReportsGenerated * progress),
                amountReportsGenerated: Math.floor(targetStats.amountReportsGenerated * progress),
                kiryanaaBills: Math.floor(targetStats.kiryanaaBills * progress),
                fuelBills: Math.floor(targetStats.fuelBills * progress),
                totalStudentsServed: Math.floor(targetStats.totalStudentsServed * progress),
                activeUsers: Math.floor(targetStats.activeUsers * progress),
                riceDistributed: Math.floor(targetStats.riceDistributed * progress)
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setStats(targetStats);
            }
        }, stepDuration);

        return () => clearInterval(interval);
    };

    // Initial fetch and setup polling
    useEffect(() => {
        fetchStats();
        
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const statItems = [
        {
            icon: <Users className="w-10 h-10 text-blue-600" />,
            value: stats.enrolledSchools,
            label: 'Enrolled Schools',
            color: 'blue'
        },
        {
            icon: <FileText className="w-10 h-10 text-green-600" />,
            value: stats.riceReportsGenerated,
            label: 'Rice Reports',
            color: 'green'
        },
        {
            icon: <Receipt className="w-10 h-10 text-orange-600" />,
            value: stats.kiryanaaBills,
            label: 'Kiryana Bills',
            color: 'orange'
        },
        {
            icon: <Package className="w-10 h-10 text-purple-600" />,
            value: stats.riceDistributed,
            label: 'Rice Distributed (Qtl)',
            color: 'purple'
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-gray-300 rounded"></div>
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Live Data Connected' : 'Using Demo Data'}
                </span>
                {lastUpdated && (
                    <span className="text-gray-500">
                        • Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {statItems.map((item, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between mb-4">
                            {item.icon}
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {item.value.toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-gray-600">
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t-2 border-gray-200 max-w-4xl mx-auto">
                <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                        {stats.totalStudentsServed.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Students Served</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                        {stats.activeUsers.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Active Users</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
                        {(stats.riceReportsGenerated + stats.amountReportsGenerated).toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Total Reports</div>
                </div>
            </div>
        </div>
    );
};

export default RealtimeStats;
