import React, { useState, useEffect } from 'react';
import { User, FileText, Clock, CheckCircle, XCircle, AlertCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import UserApplicationForm from '../component/form';

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applications, setApplications] = useState([]);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Reduced from 7 to 5 for better mobile viewing
    
    // Fetch user data from localStorage on component mount
    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
        
            if (userData) {
                setUser(userData);
            } else {
                setError("User data not found. Please sign in again.");
            }
            setLoading(false);
        } catch (error) {
            setError("Error loading user data.");
            setLoading(false);
        }
    }, []);

    // Function to fetch application status
    const fetchApplicationStatus = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch('http://localhost:5000/api/applications/status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setApplications([]);
                    return;
                }
                throw new Error(data.message || 'Error fetching application status');
            }

            // Store the array of applications sorted by date (newest first)
            const sortedApplications = (data.application || []).sort((a, b) => 
                new Date(b.submittedAt) - new Date(a.submittedAt)
            );
            setApplications(sortedApplications);
        } catch (error) {
            console.error("Error fetching application status:", error);
        }
    };

    // Fetch application status on component mount
    useEffect(() => {
        if (user) {
            fetchApplicationStatus();
        }
    }, [user]);

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/signin';
    };

    // Function to handle form submission success
    const handleFormSuccess = () => {
        // Refresh application status after submission
        setTimeout(() => {
            fetchApplicationStatus();
            setShowApplicationForm(false);
        }, 2000);
    };

    // Function to check if user can submit new application
    const canSubmitNewApplication = () => {
        if (applications.length === 0) return true;
        
        // Check if all applications are rejected
        return applications.every(app => app.status.toLowerCase() === 'rejected');
    };

    // Function to get status badge
    const getStatusBadge = (status) => {
        if (!status) return null;

        switch (status.toLowerCase()) {
            case 'pending':
                return (
                    <div className="flex items-center text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                        <Clock size={16} className="mr-1" />
                        Pending
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                        <CheckCircle size={16} className="mr-1" />
                        Approved
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                        <XCircle size={16} className="mr-1" />
                        Rejected
                    </div>
                );
            default:
                return (
                    <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {status}
                    </div>
                );
        }
    };

    // Pagination logic - always show pagination regardless of application count
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = applications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(applications.length / itemsPerPage));

    // Loading state with skeleton loader and improved animation
    if (loading) {
        return (
            <div className="min-h-screen bg-blue-100 flex flex-col">
                {/* Skeleton Header */}
                <header className="bg-blue-800 text-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded animate-pulse mr-2"></div>
                            <div className="h-8 w-32 bg-blue-600 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:block w-32 h-6 bg-blue-600 rounded animate-pulse mr-4"></div>
                            <div className="w-10 h-10 bg-blue-600 rounded-md animate-pulse"></div>
                        </div>
                    </div>
                </header>

                {/* Skeleton Main Content */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Skeleton Profile Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                                <div className="flex flex-col items-center">
                                    <div className="h-20 w-20 bg-blue-300 rounded-lg animate-pulse mb-4"></div>
                                    <div className="h-6 w-24 bg-blue-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-4 w-32 bg-blue-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-6 w-16 bg-blue-200 rounded-full animate-pulse mt-2"></div>
                                </div>
                                <div className="mt-6 border-t border-blue-200 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-20 bg-blue-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-24 bg-blue-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton Application Status Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg p-6 md:col-span-2">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-6 w-32 bg-blue-200 rounded animate-pulse"></div>
                                    <div className="h-6 w-24 bg-blue-200 rounded-full animate-pulse"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-40 bg-blue-100 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Skeleton Footer */}
                <footer className="bg-white border-t border-blue-200 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="h-4 w-48 mx-auto bg-blue-200 rounded animate-pulse"></div>
                    </div>
                </footer>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border-l-4 border-blue-500">
                    <div className="flex items-center justify-center text-blue-500 mb-4">
                        <AlertCircle size={48} />
                    </div>
                    <h1 className="text-xl text-center font-semibold text-blue-800 mb-2">Error Loading Dashboard</h1>
                    <p className="text-blue-600 text-center">{error}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => window.location.href = '/signin'}
                            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800"
                        >
                            Return to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col">
            {/* Header */}
            <header className="bg-blue-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h1 className="text-2xl font-bold">Webpe Finance</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:flex items-center mr-4">
                            <span className="text-xl font-bold text-blue-200">Welcome, {user?.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 bg-blue-900 hover:bg-blue-950 rounded-lg transition-colors"
                        >
                            <LogOut size={16} className="mr-2" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* User Profile Card */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-lg bg-gradient-to-br from-white to-blue-100">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex flex-col items-center">
                                    <div className="bg-blue-700 h-20 w-20 rounded-lg flex items-center justify-center text-3xl font-semibold text-white mb-4 shadow-md">
                                        <User size={40} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-blue-800">{user?.username}</h2>
                                    <p className="text-blue-600">{user?.email}</p>
                                    <div className="mt-2 bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                        Student
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-blue-200 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700 font-medium">Account ID</span>
                                        <span className="font-medium text-blue-900 bg-blue-100 px-2 py-1 rounded">{user?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applications List Card */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-lg md:col-span-2 bg-gradient-to-br from-white to-blue-100">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-blue-800">Application History</h2>
                                    
                                    {/* Show submit application button if all applications are rejected or no applications exist */}
                                    {canSubmitNewApplication() && (
                                        <button
                                            onClick={() => setShowApplicationForm(true)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Submit Application
                                        </button>
                                    )}
                                </div>

                                {applications.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Application Status Message */}
                                        {!canSubmitNewApplication() && (
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                                                <p className="text-blue-800 font-medium">
                                                    {applications.some(app => app.status.toLowerCase() === 'approved') 
                                                        ? "Your application has been approved."
                                                        : "Your application is pending review."}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Applications List - Responsive Table */}
                                        <div className="overflow-x-auto rounded-lg">
                                            <div className="inline-block min-w-full align-middle">
                                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                    <table className="min-w-full divide-y divide-blue-200">
                                                        <thead className="bg-blue-50">
                                                            <tr>
                                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                                    Date
                                                                </th>
                                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider whitespace-normal">
                                                                    Remarks
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-blue-100">
                                                            {currentApplications.map((app, index) => (
                                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                                                                    <td className="px-3 py-4 text-sm text-blue-900">
                                                                        {new Date(app.submittedAt).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-3 py-4">
                                                                        {getStatusBadge(app.status)}
                                                                    </td>
                                                                    <td className="px-3 py-4 text-sm text-blue-800 break-words whitespace-normal max-w-xs">
                                                                        {app.remarks || "-"}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Pagination Controls - Always show even with one application */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                                <span className="text-sm font-medium text-blue-700">
                                                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, applications.length)} of {applications.length} application{applications.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-center sm:justify-end">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`p-1 rounded-md ${
                                                        currentPage === 1 
                                                            ? 'text-blue-300 cursor-not-allowed' 
                                                            : 'text-blue-700 hover:bg-blue-200'
                                                    }`}
                                                    aria-label="Previous page"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                
                                                {/* Page Numbers - Simplified for Mobile */}
                                                <div className="flex items-center">
                                                    {(() => {
                                                        // Always show current page number, even with just 1 application
                                                        return (
                                                            <button 
                                                                className="h-8 w-8 rounded-md font-medium bg-blue-700 text-white shadow-sm"
                                                                aria-current="page"
                                                            >
                                                                {currentPage}
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`p-1 rounded-md ${
                                                        currentPage === totalPages 
                                                            ? 'text-blue-300 cursor-not-allowed' 
                                                            : 'text-blue-700 hover:bg-blue-200'
                                                    }`}
                                                    aria-label="Next page"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText size={48} className="mx-auto text-blue-400 mb-3" />
                                        <h3 className="text-lg font-medium text-blue-900 mb-1">No Applications Found</h3>
                                        <p className="text-blue-700 mb-4">You haven't submitted any applications yet.</p>
                                        <button
                                            onClick={() => setShowApplicationForm(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Submit Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-blue-800 text-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-sm text-blue-200">© 2025 Webpe Finance. All rights reserved.</p>
                </div>
            </footer>

            {/* Application Form Modal */}
            {showApplicationForm && (
                <div className="fixed inset-0 bg-blue-900/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-blue-800 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <FileText className="text-white mr-2" size={20} />
                                <h2 className="text-xl font-semibold text-white">Application Form</h2>
                            </div>
                            <button
                                onClick={() => setShowApplicationForm(false)}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <UserApplicationForm
                            onSuccess={handleFormSuccess}
                            onCancel={() => setShowApplicationForm(false)}
                            mail={user?.email}
                        />
                    </div>
                </div>
            )}
            
        </div>
    );
}