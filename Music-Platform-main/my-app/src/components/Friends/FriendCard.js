/**
 * INDIVIDUAL FRIEND CARD COMPONENT
 * 
 * This component displays individual friend information and provides social interaction options.
 * 
 * WHAT THIS FILE DOES:
 * - Displays friend profile information (name, username, profile picture)
 * - Shows real-time online/offline status with visual indicators
 * - Handles friend request acceptance/decline for pending requests
 * - Provides social action menu (message, share playlist, recommendations)
 * - Manages playlist sharing modal and functionality
 * - Displays currently playing music status
 * 
 * KEY FEATURES:
 * - Interactive friend card with hover effects
 * - Real-time online status with animated indicators
 * - Social action dropdown menu with gradient hover effects
 * - Playlist sharing modal with user's playlist selection
 * - Friend request management (accept/decline buttons)
 * - Currently playing music status display
 * - Profile picture with ring effects and status indicators
 * 
- Smooth modal animations and backdrop blur
 */

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedPOSTRequest, makeAuthenticatedGETRequest } from '../../utils/serverHelpers';

const FriendCard = ({ friend, isPending, requestId, onAccept, onDecline, onSendRecommendation, onSharePlaylist }) => {
    const navigate = useNavigate();
    const [showActions, setShowActions] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    const handleAccept = async () => {
        try {
            const response = await makeAuthenticatedPOSTRequest(`/friends/request/${requestId}/accept`, {});
            if (response.error) {
                throw new Error(response.error);
            }
            onAccept();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleDecline = async () => {
        try {
            const response = await makeAuthenticatedPOSTRequest(`/friends/request/${requestId}/decline`, {});
            if (response.error) {
                throw new Error(response.error);
            }
            onDecline();
        } catch (error) {
            console.error('Error declining request:', error);
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const fetchUserPlaylists = async () => {
        try {
            const response = await makeAuthenticatedGETRequest('/playlist/get/me');
            if (response.data) {
                setUserPlaylists(response.data);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const handleSharePlaylistClick = () => {
        fetchUserPlaylists();
        setShowPlaylistModal(true);
    };

    const handlePlaylistSelect = async (playlistId) => {
        try {
            await onSharePlaylist(friend._id, playlistId);
            setShowPlaylistModal(false);
        } catch (error) {
            console.error('Error sharing playlist:', error);
        }
    };

    return (
        <>
            <div 
                className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 rounded-2xl backdrop-blur-sm border border-gray-700/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 hover:border-gray-600/50 transition-all duration-300 group"
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-500/30 group-hover:ring-blue-400/50 transition-all duration-300">
                                <img
                                    src={friend.profilePicture}
                                    alt={friend.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {!isPending && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-gray-800 shadow-lg ${
                                    friend.isOnline ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-500'
                                }`}></div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-1">
                                {friend.firstName} {friend.lastName}
                                <span className="text-gray-400 ml-3 text-sm font-normal">@{friend.username}</span>
                            </h3>
                            {!isPending && (
                                <div className="text-sm mb-2">
                                    {friend.isOnline ? (
                                        <span className="text-green-400 flex items-center font-medium">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                            Online
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">
                                            Last seen {getTimeAgo(friend.lastSeen)}
                                        </span>
                                    )}
                                </div>
                            )}
                            {friend.currentlyPlaying && (
                                <div className="text-sm text-blue-400 flex items-center font-medium">
                                    <Icon icon="mdi:music-note" className="mr-2 text-lg" />
                                    Currently listening to music
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {isPending ? (
                            <>
                                <button
                                    onClick={handleAccept}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                                >
                                    Decline
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate(`/chat/${friend._id}`)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
                                >
                                    <Icon icon="mdi:chat" className="text-lg" />
                                    <span>Message</span>
                                </button>
                                
                                {/* Social Actions Dropdown */}
                                {showActions && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowActions(!showActions)}
                                            className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-300 hover:scale-110 border border-gray-600/30"
                                        >
                                            <Icon icon="mdi:dots-vertical" className="text-gray-300 text-lg" />
                                        </button>
                                        
                                        <div className="absolute right-0 top-full mt-3 w-56 bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl z-10 border border-gray-700/50 overflow-hidden">
                                            <div className="py-2">
                                                <button
                                                    onClick={handleSharePlaylistClick}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 flex items-center space-x-3 transition-all duration-200"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                                        <Icon icon="mdi:share-variant" className="text-blue-400" />
                                                    </div>
                                                    <span className="font-medium">Share Playlist</span>
                                                </button>
                                                <button
                                                    onClick={() => {/* Open recommendation modal */}}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-red-600/20 flex items-center space-x-3 transition-all duration-200"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                                                        <Icon icon="mdi:heart" className="text-pink-400" />
                                                    </div>
                                                    <span className="font-medium">Send Recommendation</span>
                                                </button>
                                                <button
                                                    onClick={() => {/* View friend's profile */}}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-gradient-to-r hover:from-green-600/20 hover:to-blue-600/20 flex items-center space-x-3 transition-all duration-200"
                                                >
                                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <Icon icon="mdi:account" className="text-green-400" />
                                                    </div>
                                                    <span className="font-medium">View Profile</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Playlist Selection Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Share Playlist</h3>
                            <button
                                onClick={() => setShowPlaylistModal(false)}
                                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                            >
                                <Icon icon="mdi:close" className="text-xl" />
                            </button>
                        </div>
                        
                        <p className="text-gray-300 mb-6">
                            Choose a playlist to share with <span className="text-blue-400 font-medium">{friend.firstName}</span>:
                        </p>
                        
                        <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                            {userPlaylists.map(playlist => (
                                <button
                                    key={playlist._id}
                                    onClick={() => handlePlaylistSelect(playlist._id)}
                                    className="w-full p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200 text-left flex items-center space-x-4 border border-gray-700/30 hover:border-gray-600/50"
                                >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={playlist.thumbnail}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{playlist.name}</p>
                                        <p className="text-gray-400 text-sm">{playlist.songs?.length || 0} songs</p>
                                    </div>
                                    <Icon icon="mdi:share-variant" className="text-blue-400 text-lg" />
                                </button>
                            ))}
                        </div>
                        
                        {userPlaylists.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="mdi:playlist-music" className="text-3xl text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-lg mb-2">No playlists to share</p>
                                <p className="text-gray-500 text-sm">Create a playlist first to share with friends</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FriendCard; 