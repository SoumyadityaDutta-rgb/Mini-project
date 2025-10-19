/**
 * FRIENDS & SOCIAL FEATURES MAIN COMPONENT
 * 
 * This is the main social hub component that manages all friend-related functionality.
 * 
 * WHAT THIS FILE DOES:
 * - Displays and manages the user's friend list
 * - Handles friend request acceptance/decline operations
 * - Shows pending friend requests with notification badges
 * - Displays real-time friend activity and currently playing status
 * - Provides tabbed interface for different social features
 * - Manages friend search and addition functionality
 * 
 * KEY FEATURES:
 * - Tabbed interface: Friends, Requests, and Activity tabs
 * - Real-time friend status updates (online/offline)
 * - Currently playing music status for friends
 * - Friend request management with accept/decline
 * - Playlist sharing functionality

 * - Activity feed for social interactions
 * 
 
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from '../../utils/serverHelpers';
import { useSocket } from '../../contexts/socketContext';
import FriendCard from './FriendCard';
import SearchUsers from './SearchUsers';

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'activity'
    const { socket } = useSocket();

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for friend online/offline status changes
        socket.on('friendOnline', ({ userId }) => {
            setFriends(prev => prev.map(friend => 
                friend._id === userId ? { ...friend, isOnline: true } : friend
            ));
        });

        socket.on('friendOffline', ({ userId, lastSeen }) => {
            setFriends(prev => prev.map(friend => 
                friend._id === userId ? { ...friend, isOnline: false, lastSeen } : friend
            ));
        });

        socket.on('friendCurrentlyPlaying', ({ userId, songId, timestamp }) => {
            setFriends(prev => prev.map(friend => 
                friend._id === userId ? { ...friend, currentlyPlaying: { song: songId, timestamp } } : friend
            ));
        });

        return () => {
            socket.off('friendOnline');
            socket.off('friendOffline');
            socket.off('friendCurrentlyPlaying');
        };
    }, [socket]);

    const fetchFriends = async () => {
        try {
            setIsLoading(true);
            const response = await makeAuthenticatedGETRequest('/friends/list');
            if (response.error) {
                throw new Error(response.error);
            }
            setFriends(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await makeAuthenticatedGETRequest('/friends/requests');
            if (response.error) {
                throw new Error(response.error);
            }
            setPendingRequests(response.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await makeAuthenticatedPOSTRequest(`/friends/request/${requestId}/accept`, {});
            if (response.error) {
                throw new Error(response.error);
            }
            await fetchFriends();
            await fetchPendingRequests();
        } catch (err) {
            console.error('Error accepting request:', err);
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const response = await makeAuthenticatedPOSTRequest(`/friends/request/${requestId}/decline`, {});
            if (response.error) {
                throw new Error(response.error);
            }
            await fetchPendingRequests();
        } catch (err) {
            console.error('Error declining request:', err);
        }
    };

    const handleSendRecommendation = async (friendId, songId) => {
        try {
            const response = await makeAuthenticatedPOSTRequest('/friends/recommend', {
                friendId,
                songId,
                type: 'song'
            });
            if (response.error) {
                throw new Error(response.error);
            }
            // Show success message
            alert('Recommendation sent successfully!');
        } catch (err) {
            console.error('Error sending recommendation:', err);
            alert('Failed to send recommendation');
        }
    };

    const handleSharePlaylist = async (friendId, playlistId) => {
        try {
            const response = await makeAuthenticatedPOSTRequest('/friends/share-playlist', {
                friendId,
                playlistId
            });
            if (response.error) {
                throw new Error(response.error);
            }
            alert('Playlist shared successfully!');
        } catch (err) {
            console.error('Error sharing playlist:', err);
            alert('Failed to share playlist');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-700/50 rounded-lg w-1/3"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-700/30 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
                <div className="bg-red-900/20 border border-red-800/50 text-red-300 p-4 rounded-xl backdrop-blur-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Friends & Social
                    </h2>
                    <p className="text-gray-400 text-sm">Connect, share, and discover music together</p>
                </div>
                <button
                    onClick={() => setShowSearch(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-3 group"
                >
                    <Icon icon="material-symbols:person-add" className="text-xl group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add Friend</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-8 bg-gray-800/50 p-2 rounded-2xl backdrop-blur-sm border border-gray-700/50">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === 'friends' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <Icon icon="mdi:account-group" className="text-lg" />
                        <span>Friends ({friends.length})</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === 'requests' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <Icon icon="mdi:account-clock" className="text-lg" />
                        <span>Requests ({pendingRequests.length})</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeTab === 'activity' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <Icon icon="mdi:music-note" className="text-lg" />
                        <span>Activity</span>
                    </div>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'friends' && (
                <div className="space-y-6">
                    {friends.length > 0 ? (
                        friends.map(friend => (
                            <FriendCard
                                key={friend._id}
                                friend={friend}
                                isPending={false}
                                onSendRecommendation={handleSendRecommendation}
                                onSharePlaylist={handleSharePlaylist}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon icon="mdi:account-group" className="text-4xl text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No friends yet</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Add friends to start sharing music, playlists, and recommendations. 
                                Build your music community and discover new sounds together.
                            </p>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                            >
                                Find Friends
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map(request => (
                            <FriendCard
                                key={request._id}
                                friend={request.sender}
                                isPending={true}
                                requestId={request._id}
                                onAccept={() => handleAcceptRequest(request._id)}
                                onDecline={() => handleDeclineRequest(request._id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon icon="mdi:account-clock" className="text-4xl text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No pending requests</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                When someone sends you a friend request, it will appear here. 
                                You can accept or decline each request individually.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'activity' && (
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30 p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mr-3">
                                <Icon icon="mdi:music-note" className="text-blue-400" />
                            </div>
                            Currently Listening
                        </h3>
                        {friends.filter(friend => friend.currentlyPlaying).length > 0 ? (
                            <div className="space-y-4">
                                {friends
                                    .filter(friend => friend.currentlyPlaying)
                                    .map(friend => (
                                        <div key={friend._id} className="flex items-center space-x-4 p-4 bg-gray-700/20 rounded-xl border border-gray-600/30 hover:bg-gray-700/30 transition-all duration-300">
                                            <div className="relative">
                                                <img
                                                    src={friend.profilePicture}
                                                    alt={friend.username}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                                                    friend.isOnline ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'
                                                }`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">
                                                    {friend.firstName} {friend.lastName}
                                                </p>
                                                <p className="text-gray-400 text-sm flex items-center">
                                                    <Icon icon="mdi:music-note" className="mr-1 text-blue-400" />
                                                    Listening to music
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {/* Navigate to chat */}}
                                                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-110"
                                            >
                                                <Icon icon="mdi:chat" className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="mdi:music-off" className="text-2xl text-gray-400" />
                                </div>
                                <p className="text-gray-400">No friends are currently listening to music</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl backdrop-blur-sm border border-gray-700/30 p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mr-3">
                                <Icon icon="mdi:share-variant" className="text-purple-400" />
                            </div>
                            Recent Activity
                        </h3>
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:history" className="text-2xl text-gray-400" />
                            </div>
                            <p className="text-gray-400">No recent activity to show</p>
                        </div>
                    </div>
                </div>
            )}

            {showSearch && (
                <SearchUsers
                    onClose={() => setShowSearch(false)}
                    onSendRequest={async () => {
                        await fetchPendingRequests();
                        setShowSearch(false);
                    }}
                />
            )}
        </div>
    );
};

export default FriendsList; 