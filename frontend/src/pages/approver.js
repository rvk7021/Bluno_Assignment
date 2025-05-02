import { useState, useEffect } from 'react';
import { LogOut, Search, FileText, Check, X, Eye, Menu, Loader, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ApproverDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState({
    selfie: false,
    document: false
  });

  // New state for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(7);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    } else {
      // Redirect to login if no user data found
      window.location.href = '/login';
    }
    // Fetch applications
    fetchApplications();
  }, []);

  useEffect(() => {
    // Reset to first page when filter or search changes
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:5000/api/applications/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        console.log('Applications fetched:', data.data);
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          remarks
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update the application in the state
        setApplications(applications.map(app =>
          app._id === applicationId
            ? { ...app, status, remarks, approvedAt: data.data.approvedAt }
            : app
        ));

        // Close the details view
        setViewMode(false);
        setSelectedApp(null);
        setRemarks('');

        // Fetch latest data
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApp(application);
    setViewMode(true);
    // Reset media loading states
    setMediaLoading({
      selfie: true,
      document: true
    });
  };

  const handleCloseView = () => {
    setViewMode(false);
    setSelectedApp(null);
    setRemarks('');
  };

  const handleImageLoad = (type) => {
    setMediaLoading(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const handleImageError = (type) => {
    setMediaLoading(prev => ({
      ...prev,
      [type]: false
    }));
    // You could set a state for error handling if needed
  };

  const filterApplications = () => {
    let filteredApps = applications;

    // Filter by status if not 'all'
    if (statusFilter !== 'all') {
      filteredApps = filteredApps.filter(app => app.status === statusFilter);
    }

    // Filter by search term if present
    if (searchTerm) {
      filteredApps = filteredApps.filter(app =>
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredApps;
  };

  // Get current applications for pagination
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const filteredApplications = filterApplications();
  const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  // Page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);

    setTimeout(() => setIsSearching(false), 300);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine document preview component based on file type
 // Determine document preview component based on file type
const getDocumentPreview = (path) => {
  if (!path) return null;
  
  const isPdf = path.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-blue-600 mb-2">PDF document</p>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Open PDF
        </a>
      </div>
    );
  } else {
    return (
      <img
        src={path}
        alt="Document Preview"
        className="max-h-full max-w-full object-contain"
        onLoad={() => handleImageLoad('document')}
        onError={() => handleImageError('document')}
      />
    );
  }
};

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100">
        {/* Skeleton Header */}
        <header className="bg-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded animate-pulse mr-2"></div>
              <div className="h-8 w-32 bg-blue-600 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-md animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Skeleton Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-48 bg-blue-200 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-64 bg-blue-200 rounded animate-pulse mb-6"></div>

          <div className="h-10 w-64 bg-blue-200 rounded animate-pulse mb-6"></div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="h-6 w-32 bg-blue-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-48 bg-blue-200 rounded animate-pulse mb-6"></div>

            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-blue-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-center text-blue-800">
            Please log in to access the dashboard
          </h1>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full mt-4 px-4 py-2 text-white bg-blue-700 rounded-md hover:bg-blue-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden mr-2 text-white"
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </button>
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
            <h1 className="text-xl md:text-2xl font-bold">Webpe Finance</h1>
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
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1">
        {/* User Info Card - Horizontal */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 sm:px-6 lg:px-8">

          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-blue-800">Approver Dashboard</h2>
            <p className="mt-1 text-sm text-blue-600">
              Manage and review document verification applications
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative rounded-md shadow-sm w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-blue-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-16 py-2 border border-blue-300 rounded-md leading-5 bg-white placeholder-blue-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name, email, document type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={handleSearch}
                    className="px-3 py-1 bg-blue-700 text-white rounded-r-md h-full border border-blue-700 hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className={`flex items-center ${isSearching ? 'animate-pulse' : ''}`}>
                      <Search size={16} />
                      <span className="ml-1 hidden sm:inline">Search</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'all'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'pending'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'approved'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'rejected'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-blue-700 hover:bg-blue-100'
                    }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {/* Applications table */}
          <div className="bg-white overflow-hidden shadow-lg rounded-lg bg-gradient-to-br from-white to-blue-100">
            <div className="border-b border-blue-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-blue-800">
                Applications
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-blue-600">
                {filteredApplications.length} {statusFilter !== 'all' ? statusFilter : ''} applications found
              </p>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="px-4 py-8 text-center text-blue-500">
                No applications found for the selected criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider hidden md:table-cell">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider hidden sm:table-cell">
                        Document
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider hidden lg:table-cell">
                        Submitted
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-200">
                    {currentApplications.map((application) => (
                      <tr key={application._id} className="hover:bg-blue-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white sm:mr-2">
                              <span className="text-xs font-medium">
                                {getInitials(application.studentName)}
                              </span>
                            </div>
                            <div className="ml-2 hidden sm:block">
                              <div className="text-sm font-medium text-blue-900">
                                {application.studentName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-blue-800">{application.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-blue-800">{application.documentType}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 hidden lg:table-cell">
                          {formatDate(application.submittedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="text-white bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-md transition-colors"
                          >
                            <span className="flex items-center">
                              <Eye size={16} className="sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-4 py-3 flex items-center justify-between border-t border-blue-200 bg-blue-50 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md ${currentPage === 1
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-white text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md ${currentPage === totalPages
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-white text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-blue-700">
                        Showing <span className="font-medium">{indexOfFirstApp + 1}</span> to{" "}
                        <span className="font-medium">
                          {indexOfLastApp > filteredApplications.length ? filteredApplications.length : indexOfLastApp}
                        </span>{" "}
                        of <span className="font-medium">{filteredApplications.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-blue-300 bg-white text-sm font-medium ${currentPage === 1
                              ? 'text-blue-300 cursor-not-allowed'
                              : 'text-blue-500 hover:bg-blue-100'
                            }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>

                        {/* Page numbers */}
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === index + 1
                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-100'
                              } text-sm font-medium`}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-blue-300 bg-white text-sm font-medium ${currentPage === totalPages
                              ? 'text-blue-300 cursor-not-allowed'
                              : 'text-blue-500 hover:bg-blue-100'
                            }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-blue-200">© 2025 Webpe Finance. All rights reserved.</p>
        </div>
      </footer>

      {/* Application Detail Modal */}
      {viewMode && selectedApp && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-blue-900 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full w-full max-h-full sm:max-h-none">
              <div className="bg-blue-800 px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="text-white mr-2" size={20} />
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Application Details</h2>
                </div>
                <button
                  onClick={handleCloseView}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto max-h-[70vh] sm:max-h-none">
                <div className="bg-gradient-to-br from-white to-blue-100 p-4 rounded-md mb-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Student Name</p>
                      <p className="mt-1 text-sm text-blue-900">{selectedApp.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Email</p>
                      <p className="mt-1 text-sm text-blue-900">{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Phone Number</p>
                      <p className="mt-1 text-sm text-blue-900">{selectedApp.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Document Type</p>
                      <p className="mt-1 text-sm text-blue-900">{selectedApp.documentType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Status</p>
                      <p className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedApp.status)}`}>
                          {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Submitted At</p>
                      <p className="mt-1 text-sm text-blue-900">{formatDate(selectedApp.submittedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-md font-medium text-blue-800 mb-2">Document Preview</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Selfie</p>
                      <div className="border border-blue-200 rounded-md p-2 bg-blue-50 h-40 flex items-center justify-center relative">
                        {mediaLoading.selfie && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80">
                            <Loader className="animate-spin text-blue-600" size={24} />
                          </div>
                        )}
                        {selectedApp.selfiePath ? (
                          <img
                            src={selectedApp.selfiePath}
                            alt="Selfie Preview"
                            className="max-h-36 max-w-full object-contain"
                            onLoad={() => handleImageLoad('selfie')}
                            onError={() => handleImageError('selfie')}
                          />
                        ) : (
                          <div className="text-sm text-blue-500 text-center">No selfie available</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Proof of Address</p>
                      <div className="border border-blue-200 rounded-md p-2 bg-blue-50 h-40 flex items-center justify-center relative">

                        {selectedApp.proofOfAddressPath ? (
                          getDocumentPreview(selectedApp.proofOfAddressPath)
                        ) : (
                          <div className="text-sm text-blue-500 text-center">No document available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedApp.status === 'pending' && (
                  <div className="mt-4">
                    <label htmlFor="remarks" className="block text-sm font-medium text-blue-700 mb-1">
                      Remarks (optional)
                    </label>
                    <textarea
                      id="remarks"
                      rows="3"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-blue-300 rounded-md bg-blue-50"
                      placeholder="Add any remarks or reasons for approval/rejection"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>
                )}

                {selectedApp.remarks && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-600">Previous Remarks</p>
                    <p className="mt-1 text-sm text-blue-800 bg-blue-50 p-2 rounded border border-blue-200">{selectedApp.remarks}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse border-t border-blue-200">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto mb-2 sm:mb-0"
                      onClick={() => handleUpdateStatus(selectedApp._id, 'approved')}
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto mb-2 sm:mb-0"
                      onClick={() => handleUpdateStatus(selectedApp._id, 'rejected')}
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-blue-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto"
                  onClick={handleCloseView}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}