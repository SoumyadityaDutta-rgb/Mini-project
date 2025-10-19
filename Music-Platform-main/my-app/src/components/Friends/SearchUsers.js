/**
 * USER SEARCH AND FRIEND REQUEST COMPONENT
 * 
 * This component provides functionality to search for users and send friend requests.
 * 
 * WHAT THIS FILE DOES:
 * - Provides a search interface to find users by username or name
 * - Displays search results with user profile information
 * - Handles sending friend requests to found users
 * - Manages search loading states and error handling
 * - Provides empty states for no search results
 * 
 * KEY FEATURES:
 * - Real-time user search with backend API integration
 * - Search input with icon and focus states

 * 
 
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from '../../utils/serverHelpers';

const SearchUsers = ({ onClose, onSendRequest }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await makeAuthenticatedGETRequest(`/friends/search/${searchQuery}`);
            if (response.error) {
                throw new Error(response.error);
            }
            setSearchResults(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            const response = await makeAuthenticatedPOSTRequest('/friends/request', {
                receiverId: userId
            });
            if (response.error) {
                throw new Error(response.error);
            }
            onSendRequest();
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-2xl border border-gray-700/50 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Add Friends</h2>
                        <p className="text-gray-400">Search and connect with other music lovers</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                    >
                        <Icon icon="mdi:close" className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Icon icon="mdi:magnify" className="text-gray-400 text-lg" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by username or name..."
                                className="w-full bg-gray-800/50 text-white px-12 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-gray-800/70 border border-gray-700/50 transition-all duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Icon icon="eos-icons:loading" className="animate-spin text-lg" />
                            ) : (
                                <Icon icon="mdi:magnify" className="text-lg" />
                            )}
                            <span>{isLoading ? 'Searching...' : 'Search'}</span>
                        </button>
                    </div>
                </form>

                {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={`skeleton-${i}`} className="h-20 bg-gray-800/30 rounded-xl border border-gray-700/30"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-800/50 text-red-300 p-4 rounded-xl backdrop-blur-sm">
                        {error}
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {searchResults.map(user => (
                            <div
                                key={user._id}
                                className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-5 rounded-xl flex items-center justify-between border border-gray-700/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:border-gray-600/50 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-blue-500/30">
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <p className="text-gray-400 text-sm">@{user.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSendRequest(user._id)}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                                >
                                    <Icon icon="mdi:account-plus" className="text-lg" />
                                    <span>Add Friend</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : searchQuery && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:account-search" className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                        <p className="text-gray-400">No users found matching "{searchQuery}"</p>
                    </div>
                )}

                {!searchQuery && !isLoading && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:account-search" className="text-3xl text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Search for Friends</h3>
                        <p className="text-gray-400">Enter a username or name to find and connect with other users</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchUsers;
