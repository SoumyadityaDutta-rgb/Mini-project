/**
 * INDIVIDUAL SONG CARD COMPONENT
 * 
 * This component displays individual song information and provides playback controls.
 * 
 * WHAT THIS FILE DOES:
 * - Displays song metadata (title, artist, duration, cover art)
 * - Provides play/pause functionality for songs
 * - Handles song like/unlike operations
 * - Manages add to playlist functionality
 * - Shows song playback progress and status
 * - Provides song sharing and social features
 * 
 
 */

import React, { useState, useEffect, useContext } from "react";
import songContext from "../../contexts/songContext";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest, makeAuthenticatedDELETERequest } from "../../utils/serverHelpers";

const formatTime = (duration) => {
    if (!duration) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SingleSongCard = ({ info, playSound, setAddToPlaylistModalOpen, onAddToPlaylist, handleAddToPlaylist, onDelete }) => {
    const { currentSong, setCurrentSong } = useContext(songContext);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const isOwner = info.artist && typeof info.artist === 'object' && info.artist._id === localStorage.getItem('userId');

    // Format artist name from the artist object
    const artistName = info.artist ? 
        (typeof info.artist === 'string' ? info.artist : 
         `${info.artist.firstName || ''} ${info.artist.lastName || ''}`.trim()) : 
        'Unknown Artist';

    // Check if song is liked when component mounts
    useEffect(() => {
        const checkLikedStatus = async () => {
            try {
                const response = await makeAuthenticatedGETRequest(`/song/is-liked/${info._id}`);
                if (!response.error) {
                    setIsLiked(response.isLiked);
                }
            } catch (error) {
                console.error("Error checking liked status:", error);
            }
        };
        checkLikedStatus();
    }, [info._id]);

    const handleDelete = async (e) => {
        e.stopPropagation();
        try {
            if (isOwner) {
                // Delete song from server (MyMusic)
                const response = await makeAuthenticatedDELETERequest(`/song/delete/${info._id}`);
                if (response.error) {
                    console.error("Failed to delete song:", response.error);
                    return;
                }
                if (onDelete) {
                    onDelete(info._id);
                }
            } else {
                // Remove from liked songs (LikedSongs)
                const response = await makeAuthenticatedPOSTRequest("/song/unlike", {
                    songId: info._id
                });
                if (response.error) {
                    console.error("Failed to unlike song:", response.error);
                    return;
                }
                if (onDelete) {
                    onDelete(info._id);
                }
            }
        } catch (error) {
            console.error("Error deleting/unliking song:", error);
        }
    };

    const toggleLike = async (e) => {
        e.stopPropagation();
        if (isLikeLoading) return;

        try {
            setIsLikeLoading(true);
            const endpoint = isLiked ? "/song/unlike" : "/song/like";
            const response = await makeAuthenticatedPOSTRequest(endpoint, {
                songId: info._id
            });
            
            if (response.error) {
                console.error("Failed to toggle like:", response.error);
                return;
            }

            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error toggling like:", error);
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Use either onAddToPlaylist or handleAddToPlaylist
    const addToPlaylistHandler = onAddToPlaylist || handleAddToPlaylist;

    return (
        <div
            className="flex hover:bg-gray-800 p-4 rounded-lg group transition-all duration-300"
            onClick={() => {
                setCurrentSong({...info, duration: info.duration || 0});
            }}
        >
            <div
                className="w-14 h-14 bg-cover bg-center rounded-md flex-shrink-0"
                style={{
                    backgroundImage: `url("${info.thumbnail}")`,
                }}
            ></div>
            <div className="flex flex-col justify-center ml-4 flex-grow">
                <div className="text-white font-semibold hover:underline cursor-pointer">
                    {info.name}
                </div>
                <div className="text-gray-400 text-sm hover:text-white cursor-pointer">
                    {artistName}
                </div>
            </div>
            <div className="flex items-center">
                {setAddToPlaylistModalOpen && (
                    <button 
                        className="p-2 rounded-full hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (addToPlaylistHandler) {
                                addToPlaylistHandler(info);
                            }
                            setAddToPlaylistModalOpen(true);
                        }}
                    >
                        <Icon icon="material-symbols:playlist-add" className="text-gray-400 hover:text-white text-2xl" />
                    </button>
                )}
                <button 
                    className={`p-2 rounded-full hover:bg-gray-700 transition-all duration-300 relative group/btn ${
                        isLiked ? 'text-green-500' : 'text-gray-400'
                    }`}
                    onClick={toggleLike}
                    disabled={isLikeLoading}
                >
                    <Icon 
                        icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
                        className={`text-xl transition-colors duration-200 ${
                            isLikeLoading ? 'animate-pulse' : ''
                        }`}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                    </div>
                </button>
                {isOwner && (
                    <button 
                        className="p-2 rounded-full hover:bg-gray-700 transition-all duration-300 relative group/btn ml-2"
                        onClick={handleDelete}
                    >
                        <Icon 
                            icon="mdi:delete" 
                            className="text-gray-400 hover:text-red-500 text-xl transition-colors duration-200" 
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Delete Song
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SingleSongCard;