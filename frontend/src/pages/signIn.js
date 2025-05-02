import React, { useState } from 'react';
import { AtSign, Lock, Check, AlertCircle } from 'lucide-react';

export default function SignInCard() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear errors when user is typing
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);
            
            // API endpoint for signin
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle invalid credentials or other errors
                throw new Error(data.message || 'Error in signin process');
            }
            
            // Handle successful login
            setSuccess('Login successful!');
            
            // Store token in localStorage or sessionStorage
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Redirect to dashboard or home page after successful login
            // For now, we'll just show a success message
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-blue-700 px-8 pt-10 pb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-white mr-2"
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
                        <h1 className="text-3xl font-bold text-white">
                            WebPe Finance
                        </h1>
                    </div>
                    <p className="text-blue-100 text-sm">Access your secure account</p>
                </div>

                {/* Sign In Form */}
                <div className="px-8 py-8 bg-white">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>
                    
                    <div className="space-y-5">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AtSign size={18} className="text-blue-600" />
                            </div>
                            <input
                                required
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                placeholder="Email Address"
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full bg-gray-50 text-gray-800 pl-10 py-3 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 disabled:opacity-60"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-blue-600" />
                            </div>
                            <input
                                required
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                placeholder="Password"
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full bg-gray-50 text-gray-800 pl-10 py-3 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 disabled:opacity-60"
                            />
                        </div>
                        

                        
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                        
                        {/* Success message */}
                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded flex items-start">
                                <Check className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{success}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full font-semibold bg-blue-600 text-white py-3.5 rounded-lg shadow transition-all duration-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-60 disabled:hover:bg-blue-600 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : "Sign In"}
                        </button>
                    </div>

                    {/* Security note */}
                    <div className="mt-6 text-xs text-gray-500 flex items-center justify-center">
                        <Lock size={12} className="mr-1" />
                        <span>Secured with 256-bit encryption</span>
                    </div>
                </div>

                {/* Create Account Link */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <a
                            href="/signup"
                            className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-300"
                        >
                            Create Account
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}