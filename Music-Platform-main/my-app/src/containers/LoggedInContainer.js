/**
 * MAIN LAYOUT CONTAINER FOR AUTHENTICATED USERS
 * 
 * This is the primary layout component that wraps all authenticated user pages.
 * 
 * WHAT THIS FILE DOES:
 * - Provides the main application layout with sidebar navigation
 * - Manages the global music player state and controls
 * - Handles playlist creation and management modals
 * - Manages user authentication and profile data
 * - Provides context for song playback and playlist operations

 * 
 
 */

import React, {useContext, useState, useLayoutEffect, useRef, useEffect, useCallback} from "react";
import {Howl, Howler} from "howler";
import {Icon} from "@iconify/react";
import IconText from "../components/shared/IconText";
import {useNavigate} from "react-router-dom";
import TextWithHover from "../components/shared/TextWithHover";
import songContext from "../contexts/songContext";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import {makeAuthenticatedPOSTRequest, makeAuthenticatedGETRequest, clearToken} from "../utils/serverHelpers";
import {removeCookie} from "../utils/cookie";
import logoImg from '../assets/images/img.jpg';

// Configure Howler globally for better quality
Howler.autoUnlock = true;
Howler.html5PoolSize = 12;
Howler.usingWebAudio = true;

const LoggedInContainer = (props) => {
    const { children, curActiveScreen, openMessages, messagesActive } = props;
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [createPlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const firstUpdate = useRef(true);
    const animationRef = useRef();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [userError, setUserError] = useState(null);

    const {
        currentSong,
        setCurrentSong,
        soundPlayed,
        setSoundPlayed,
        isPaused,
        setIsPaused,
        isChangingSong,
        setIsChangingSong,
        currentPlaylist,
        setCurrentPlaylist,
        currentIndex,
        setCurrentIndex
    } = useContext(songContext);

    // Get user's playlists
    useEffect(() => {
        const getPlaylists = async () => {
            try {
                setIsLoadingPlaylists(true);
                const response = await makeAuthenticatedGETRequest("/playlist/get/me");
                if (response.data) {
                    setPlaylists(response.data);
                }
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setIsLoadingPlaylists(false);
            }
        };
        getPlaylists();
    }, []);

    // Fetch pending friend requests
    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const response = await makeAuthenticatedGETRequest('/friends/requests');
                if (response.data) {
                    setPendingRequests(response.data);
                }
            } catch (error) {
                console.error('Error fetching pending requests:', error);
            }
        };
        fetchPendingRequests();
    }, []);

    // State
    const [isDragging, setIsDragging] = useState(false);
    const [isVolumeDragging, setIsVolumeDragging] = useState(false);

    // Refs
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);

    // Utility functions
    const formatTime = useCallback((time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Animation frame handler
    const updateProgress = () => {
        if (soundPlayed && !isPaused && !isDragging) {
            const seek = soundPlayed.seek();
            setCurrentTime(typeof seek === 'number' ? seek : 0);
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    // Start progress update loop on play
    useEffect(() => {
        if (soundPlayed && !isPaused && !isDragging) {
            animationRef.current = requestAnimationFrame(updateProgress);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [soundPlayed, isPaused, isDragging]);

    // Initialize new song
    useLayoutEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if (!currentSong) {
            console.log("No current song to initialize");
            return;
        }

        if (isChangingSong) {
            console.log("Song change in progress, skipping initialization");
            return;
        }
        
        console.log("Initializing new song:", currentSong.name);
        
        // Stop previous sound if exists
        if (soundPlayed) {
            console.log("Stopping previous sound");
            soundPlayed.unload();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        try {
            setIsChangingSong(true);
            
            const sound = new Howl({
                src: [currentSong.track],
                html5: false, // Use Web Audio API for better quality
                format: ['mp3'],
                volume: volume,
                preload: true,
                buffer: true,
                onload: () => {
                    console.log("Song loaded successfully");
                    setDuration(sound.duration());
                    setIsChangingSong(false);
                    if (curActiveScreen === "myMusic" && !isPaused) {
                        sound.play();
                        setIsPaused(false);
                        animationRef.current = requestAnimationFrame(updateProgress);
                    }
                },
                onplay: () => {
                    console.log("Song started playing");
                    setIsPaused(false);
                    animationRef.current = requestAnimationFrame(updateProgress);
                },
                onpause: () => {
                    console.log("Song paused");
                    setIsPaused(true);
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                    }
                },
                onstop: () => {
                    console.log("Song stopped");
                    setIsPaused(true);
                    setCurrentTime(0);
                    if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current);
                    }
                },
                onend: () => {
                    console.log("Song ended, playing next");
                    if (currentPlaylist && currentPlaylist.length > 0) {
                        playNext();
                    } else {
                        setIsPaused(true);
                        setCurrentTime(0);
                    }
                },
                onloaderror: (id, err) => {
                    console.error("Error loading audio:", err);
                    setIsChangingSong(false);
                },
                onseek: () => {
                    console.log("Song seeked");
                    if (!isPaused) {
                        animationRef.current = requestAnimationFrame(updateProgress);
                    }
                }
            });

            console.log("Setting new sound");
            setSoundPlayed(sound);
        } catch (error) {
            console.error("Error creating Howl instance:", error);
            setIsChangingSong(false);
        }
    }, [currentSong, curActiveScreen]);

    // Handle play/pause with better quality control
    const playSound = () => {
        if (!soundPlayed || isChangingSong) {
            console.log("Cannot play: No sound or song changing");
            return;
        }
        
        // Ensure audio context is in good state
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        
        console.log("Playing sound...");
        soundPlayed.play();
        setIsPaused(false);
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    const pauseSound = () => {
        if (!soundPlayed || isChangingSong) {
            console.log("Cannot pause: No sound or song changing");
            return;
        }
        
        console.log("Pausing sound...");
        soundPlayed.pause();
        setIsPaused(true);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const togglePlayPause = () => {
        console.log("Toggle play/pause", { isPaused, soundPlayed: !!soundPlayed });
        if (isPaused) {
            playSound();
        } else {
            pauseSound();
        }
    };

    // Play next song
    const playNext = useCallback(() => {
        if (!currentPlaylist || currentPlaylist.length === 0 || isChangingSong) {
            console.log("Cannot play next: No playlist or song changing");
            return;
        }

        console.log("Playing next song from index", currentIndex);
        const nextIndex = (currentIndex + 1) % currentPlaylist.length;
        const nextSong = currentPlaylist[nextIndex];
        
        setCurrentIndex(nextIndex);
        setCurrentSong(nextSong);
    }, [currentPlaylist, currentIndex, setCurrentIndex, setCurrentSong, isChangingSong]);

    // Play previous song
    const playPrevious = useCallback(() => {
        if (!currentPlaylist || currentPlaylist.length === 0 || isChangingSong) {
            console.log("Cannot play previous: No playlist or song changing");
            return;
        }

        console.log("Playing previous song from index", currentIndex);
        const prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        const prevSong = currentPlaylist[prevIndex];
        
        setCurrentIndex(prevIndex);
        setCurrentSong(prevSong);
    }, [currentPlaylist, currentIndex, setCurrentIndex, setCurrentSong, isChangingSong]);

    // Progress bar handlers
    const handleProgressBarClick = (e) => {
        if (!soundPlayed || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        const seekTime = percentage * duration;
        soundPlayed.seek(seekTime);
        setCurrentTime(seekTime);
    };

    const handleProgressBarDragStart = (e) => {
        setIsDragging(true);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        handleProgressBarDrag(e);
    };

    const handleProgressBarDrag = (e) => {
        if (!isDragging || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = x / rect.width;
        const seekTime = percentage * duration;
        setCurrentTime(seekTime);
    };

    const handleProgressBarDragEnd = () => {
        if (!isDragging || !soundPlayed) return;
        soundPlayed.seek(currentTime);
        setIsDragging(false);
        if (!isPaused) {
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    // Mouse event handlers for progress bar
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                handleProgressBarDrag(e);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                handleProgressBarDragEnd();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Volume control handlers
    const handleVolumeChange = useCallback((e) => {
        if (!volumeBarRef.current || !soundPlayed) return;
        
        const rect = volumeBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newVolume = Math.max(0, Math.min(x / rect.width, 1));
        
        setVolume(newVolume);
        soundPlayed.volume(newVolume);
    }, [soundPlayed]);

    const handleVolumeDragStart = (e) => {
        setIsVolumeDragging(true);
        handleVolumeChange(e);
    };

    const handleVolumeDrag = (e) => {
        if (!isVolumeDragging) return;
        handleVolumeChange(e);
    };

    const handleVolumeDragEnd = () => {
        setIsVolumeDragging(false);
    };

    // Mouse event handlers for volume
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isVolumeDragging) {
                handleVolumeDrag(e);
            }
        };

        const handleMouseUp = () => {
            if (isVolumeDragging) {
                handleVolumeDragEnd();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isVolumeDragging, handleVolumeDrag]);

    // Effect for auto-play when changing songs
    useEffect(() => {
        if (soundPlayed && !isPaused) {
            soundPlayed.play();
        }
    }, [soundPlayed, isPaused]);

    // Effect for cleanup with proper audio handling
    useEffect(() => {
        return () => {
            if (soundPlayed) {
                // Ensure proper cleanup of audio resources
                soundPlayed.fade(volume, 0, 100); // Smooth fade out
                setTimeout(() => {
                    soundPlayed.unload();
                }, 100);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setIsChangingSong(false);
        };
    }, [soundPlayed, volume]);

    // Effect for stopping playback when leaving MyMusic
    useEffect(() => {
        if (curActiveScreen !== "myMusic") {
            console.log("Leaving MyMusic, handling audio cleanup");
            if (soundPlayed) {
                // Smooth transition when leaving
                soundPlayed.fade(volume, 0, 100);
                setTimeout(() => {
                    soundPlayed.pause();
                    setIsPaused(true);
                }, 100);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
    }, [curActiveScreen, volume]);

    const addSongToPlaylist = async (playlistId) => {
        if (!selectedSongForPlaylist) {
            console.error("No song selected for playlist");
            return;
        }

        const songId = selectedSongForPlaylist._id;
        const payload = {playlistId, songId};
        
        try {
            const response = await makeAuthenticatedPOSTRequest(
                "/playlist/add/song",
                payload
            );
            
            if (response.error) {
                console.error("Failed to add song to playlist:", response.error);
                // You might want to show an error toast/notification here
                return;
            }

            if (response._id) {
                // Successfully added song to playlist
                setAddToPlaylistModalOpen(false);
                setSelectedSongForPlaylist(null);
                // You might want to show a success toast/notification here
            }
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            // You might want to show an error toast/notification here
        }
    };

    const downloadCurrentSong = async () => {
        if (!currentSong || !currentSong.track) {
            alert("No song is currently selected");
            return;
        }

        try {
            // Show loading state
            const downloadButton = document.querySelector('.download-button');
            if (downloadButton) {
                downloadButton.classList.add('opacity-50');
            }

            // Fetch the song file
            const response = await fetch(currentSong.track);
            if (!response.ok) throw new Error('Failed to download song');
            
            // Convert the response to a blob
            const blob = await response.blob();
            
            // Create a blob URL
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = blobUrl;
            
            // Set the filename - remove any invalid characters
            const fileName = currentSong.name.replace(/[^a-zA-Z0-9-_ ]/g, '');
            link.download = `${fileName}.mp3`;
            
            // Append to document, click, and cleanup
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(link);
            
            if (downloadButton) {
                downloadButton.classList.remove('opacity-50');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download the song. Please try again.');
            
            const downloadButton = document.querySelector('.download-button');
            if (downloadButton) {
                downloadButton.classList.remove('opacity-50');
            }
        }
    };

    // Add like functionality
    const toggleLike = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (!currentSong || isLikeLoading) return;

        try {
            setIsLikeLoading(true);
            const endpoint = isLiked ? "/song/unlike" : "/song/like";
            const response = await makeAuthenticatedPOSTRequest(endpoint, {
                songId: currentSong._id
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

    // Check if current song is liked
    useEffect(() => {
        const checkLikedStatus = async () => {
            if (!currentSong) {
                setIsLiked(false);
                return;
            }

            try {
                const response = await makeAuthenticatedGETRequest(
                    `/song/is-liked/${currentSong._id}`
                );
                if (response.error) {
                    console.error("Error checking liked status:", response.error);
                    setIsLiked(false);
                    return;
                }
                setIsLiked(response.isLiked);
            } catch (error) {
                console.error("Error checking liked status:", error);
                setIsLiked(false);
            }
        };

        checkLikedStatus();
    }, [currentSong]);

    // Add function to handle adding to playlist
    const handleAddToPlaylist = (song) => {
        setSelectedSongForPlaylist(song);
        setAddToPlaylistModalOpen(true);
    };

    const handleLogout = () => {
        removeCookie("token");
        navigate("/login");
    };

    const fetchUserData = async () => {
        try {
            setIsLoadingUser(true);
            setUserError(null);
            const response = await makeAuthenticatedGETRequest("/auth/current-user");
            if (response && !response.error) {
                setUserData(response);
            } else {
                setUserError(response.error || "Failed to fetch user data");
                // If we get an authentication error, redirect to login
                if (response.error === "Not authenticated") {
                    removeCookie("token");
                    navigate("/login");
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserError(error.message);
        } finally {
            setIsLoadingUser(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    // ContentWrapper component to handle props properly
    const ContentWrapper = ({ children, handleAddToPlaylist, addSongToPlaylist }) => {
        return React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { 
                    onAddToPlaylist: handleAddToPlaylist,
                    addSongToPlaylist: addSongToPlaylist
                });
            }
            return child;
        });
    };

    return (
        <div className="h-screen w-full bg-black">
            {/* Modals */}
            {createPlaylistModalOpen && (
                <div className="fixed inset-0 z-[60]">
                    <CreatePlaylistModal 
                        closeModal={() => {
                            setCreatePlaylistModalOpen(false);
                            // Refresh the playlists after creation
                            const getData = async () => {
                                try {
                                    const playlistResponse = await makeAuthenticatedGETRequest("/playlist/get/me");
                                    if (playlistResponse.data) {
                                        setPlaylists(playlistResponse.data);
                                    }
                                } catch (err) {
                                    console.error("Error fetching playlists:", err);
                                }
                            };
                            getData();
                        }} 
                    />
                </div>
            )}
            {addToPlaylistModalOpen && (
                <div className="fixed inset-0 z-[60]">
                    <AddToPlaylistModal
                        closeModal={() => {
                            setAddToPlaylistModalOpen(false);
                            setSelectedSongForPlaylist(null);
                        }}
                        addSongToPlaylist={addSongToPlaylist}
                    />
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-1/5 bg-black flex flex-col justify-between border-r border-gray-900">
                    <div>
                        <div className="p-6">
                            <div className="flex items-center space-x-3">
                                <img src={logoImg} alt="Victor logo" style={{ height: 36, width: 36, borderRadius: 8, boxShadow: '0 2px 8px #0004' }} />
                                <span className="text-3xl font-extrabold tracking-wide" style={{
                                    background: 'linear-gradient(90deg, #a78bfa 30%, #60a5fa 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: 'Segoe UI, system-ui, sans-serif',
                                    letterSpacing: '0.04em',
                                    textShadow: '0 2px 16px #a78bfa22'
                                }}>
                                    Victor
                                </span>
                                <span className="text-4xl" style={{
                                    background: 'linear-gradient(135deg, #a78bfa 40%, #60a5fa 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    display: 'inline-block',
                                    filter: 'drop-shadow(0 2px 8px #a78bfa44)'
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 17V5l10-2v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="7" cy="17" r="3" fill="currentColor"/>
                                        <circle cx="17" cy="15" r="3" fill="currentColor"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div className="py-5">
                            <IconText 
                                iconName={"material-symbols:home"} 
                                displayText={"Home"} 
                                targetLink={"/home"}
                                active={curActiveScreen === "home"}
                            />
                            <IconText 
                                iconName={"material-symbols:search-rounded"} 
                                displayText={"Search"} 
                                targetLink={"/search"}
                                active={curActiveScreen === "search"}
                            />
                            <IconText 
                                iconName={"material-symbols:library-music-sharp"} 
                                displayText={"Library"} 
                                targetLink={"/library"}
                                active={curActiveScreen === "library"}
                            />
                            <IconText 
                                iconName={"material-symbols:music-note"} 
                                displayText={"My Music"} 
                                targetLink={"/myMusic"}
                                active={curActiveScreen === "myMusic"}
                            />
                            <IconText 
                                iconName={"ph:book-open"} 
                                displayText={"Audiobooks"} 
                                targetLink={"/audiobooks"}
                                active={curActiveScreen === "audiobooks"}
                            />
                            <div className="relative">
                                <IconText 
                                    iconName={"fluent:chat-sparkle-24-filled"} 
                                    displayText={"Friends & Chat"} 
                                    targetLink={"/friends"}
                                    active={curActiveScreen === "friends"}
                                />
                                {pendingRequests.length > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                        {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-5 px-5">
                            <div className="flex items-center justify-between">
                                <button 
                                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                                    onClick={() => setCreatePlaylistModalOpen(true)}
                                >
                                    <div className="p-1 bg-gray-400 hover:bg-white transition-colors rounded-sm">
                                        <Icon icon="material-symbols:add" className="text-black text-xl" />
                                    </div>
                                    <span className="font-semibold">Create Playlist</span>
                                </button>
                            </div>
                            <div className="pt-4">
                                <button 
                                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                                    onClick={() => navigate("/liked-songs")}
                                >
                                    <div className="p-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-sm">
                                        <Icon icon="mdi:heart" className="text-white text-xl" />
                                    </div>
                                    <span className="font-semibold">Liked Songs</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 pb-4">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <TextWithHover displayText={"Install App"} />
                            <Icon icon="material-symbols:download" className="text-gray-400 hover:text-white text-xl cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                                    <Icon icon="mdi:user" className="text-white text-xl" />
                                </div>
                                <span className="text-white font-semibold">
                                    {isLoadingUser ? (
                                        "Loading..."
                                    ) : userError ? (
                                        "Error loading user"
                                    ) : userData ? (
                                        userData.username || `${userData.firstName} ${userData.lastName || ''}`
                                    ) : (
                                        "Guest User"
                                    )}
                                </span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white"
                            >
                                <Icon icon="material-symbols:logout" className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900 to-black">
                    <div className="p-8 pb-28">
                        <ContentWrapper
                            handleAddToPlaylist={handleAddToPlaylist}
                            addSongToPlaylist={addSongToPlaylist}
                        >
                            {children}
                        </ContentWrapper>
                    </div>
                </div>
            </div>

            {/* Music Player */}
            {currentSong && (curActiveScreen === "myMusic" || curActiveScreen === "audiobooks") && (
                <div className="h-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-800 text-white flex items-center px-4">
                    <div className="w-1/4 flex items-center">
                        <div className="relative group">
                            <img
                                src={currentSong.thumbnail}
                                alt="currentSongThumbail"
                                className="h-16 w-16 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
                                <Icon 
                                    icon="mdi:music"
                                    className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                />
                            </div>
                        </div>
                        <div className="pl-4">
                            <div className="text-sm font-medium hover:underline cursor-pointer text-white truncate max-w-[200px]">
                                {currentSong.name}
                            </div>
                            <div className="text-xs text-gray-400 hover:underline cursor-pointer hover:text-gray-300 mt-1 truncate max-w-[200px]">
                                {currentSong.author
                                    ? currentSong.author
                                    : (currentSong.artist.firstName + " " + currentSong.artist.lastName)}
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col justify-center items-center">
                        {/* Playback Controls */}
                        <div className="flex flex-col items-center mb-3">
                            <div className="flex items-center gap-4">
                                <button 
                                    className="text-gray-400 hover:text-white transition-colors"
                                    onClick={playPrevious}
                                    disabled={!currentPlaylist || currentPlaylist.length === 0 || isChangingSong}
                                >
                                    <Icon icon="mdi:skip-previous" className="text-3xl" />
                                </button>
                                
                                <button 
                                    className="bg-white rounded-full p-2 hover:scale-105 transition-transform"
                                    onClick={() => {
                                        if (soundPlayed) {
                                            if (isPaused) {
                                                soundPlayed.play();
                                                setIsPaused(false);
                                            } else {
                                                soundPlayed.pause();
                                                setIsPaused(true);
                                            }
                                        }
                                    }}
                                >
                                    <Icon
                                        icon={isPaused ? "mdi:play" : "mdi:pause"}
                                        className="text-black text-2xl"
                                    />
                                </button>
                                
                                <button 
                                    className="text-gray-400 hover:text-white transition-colors"
                                    onClick={playNext}
                                    disabled={!currentPlaylist || currentPlaylist.length === 0 || isChangingSong}
                                >
                                    <Icon icon="mdi:skip-next" className="text-3xl" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full flex items-center gap-3 px-4">
                            <span className="text-xs text-gray-400 w-10 text-right font-medium">
                                {formatTime(currentTime)}
                            </span>
                            
                            <div 
                                ref={progressBarRef}
                                className="flex-1 h-1.5 bg-gray-800 rounded-full cursor-pointer group relative"
                                onClick={handleProgressBarClick}
                                onMouseDown={handleProgressBarDragStart}
                            >
                                <div 
                                    className="absolute h-full bg-green-500 rounded-full transition-all duration-200"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                >
                                    <div 
                                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 ${
                                            isDragging ? 'opacity-100 scale-110' : ''
                                        } transition-all duration-200 shadow-lg`}
                                    />
                                </div>
                            </div>
                            
                            <span className="text-xs text-gray-400 w-10 font-medium">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    <div className="w-1/4 flex items-center justify-end space-x-4">
                        {/* Like Button */}
                        <button 
                            className={`p-2 rounded-full hover:bg-gray-800 transition-all duration-200 relative group ${
                                isLiked ? 'text-green-500' : 'text-gray-400'
                            }`}
                            onClick={toggleLike}
                            disabled={isLikeLoading}
                        >
                            <Icon
                                icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
                                className={`text-2xl transition-all duration-200 ${
                                    isLikeLoading ? 'animate-pulse' : ''
                                }`}
                            />
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                {isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                            </div>
                        </button>

                        {/* Add to Playlist Button */}
                        <button 
                            className="p-2 rounded-full hover:bg-gray-800 transition-all duration-200 relative group"
                            onClick={() => {
                                setSelectedSongForPlaylist(currentSong);
                                setAddToPlaylistModalOpen(true);
                            }}
                            disabled={!currentSong}
                        >
                            <Icon
                                icon="material-symbols:playlist-add"
                                className="text-2xl text-gray-400 group-hover:text-white transition-colors duration-200"
                            />
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Add to Playlist
                            </div>
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center space-x-2 group relative">
                            <button
                                className="text-gray-400 hover:text-white transition-colors duration-200"
                                onClick={() => {
                                    if (soundPlayed) {
                                        const newVolume = volume === 0 ? 1 : 0;
                                        setVolume(newVolume);
                                        soundPlayed.volume(newVolume);
                                    }
                                }}
                            >
                                <Icon 
                                    icon={
                                        volume === 0 
                                            ? "mdi:volume-off"
                                            : volume < 0.5 
                                                ? "mdi:volume-low"
                                                : "mdi:volume-high"
                                    }
                                    className="text-xl"
                                />
                            </button>
                            <div 
                                ref={volumeBarRef}
                                className="w-24 h-1.5 bg-gray-800 rounded-full cursor-pointer relative opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={handleVolumeChange}
                                onMouseDown={handleVolumeDragStart}
                            >
                                <div 
                                    className="absolute h-full bg-green-500 rounded-full"
                                    style={{ width: `${volume * 100}%` }}
                                >
                                    <div 
                                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 ${
                                            isVolumeDragging ? 'opacity-100 scale-110' : ''
                                        } transition-all duration-200 shadow-lg`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button 
                            className="p-2 rounded-full hover:bg-gray-800 transition-all duration-200 relative group ml-2"
                            onClick={async () => {
                                if (currentSong && currentSong.track) {
                                    try {
                                        // Start download
                                        const response = await fetch(currentSong.track);
                                        const blob = await response.blob();
                                        
                                        // Create object URL for the blob
                                        const url = window.URL.createObjectURL(blob);
                                        
                                        // Create temporary link and trigger download
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `${currentSong.name}.mp3`;
                                        
                                        // Append to body, click, and cleanup
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        
                                        // Cleanup object URL
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Error downloading song:", error);
                                        // You might want to show an error message to the user here
                                    }
                                }
                            }}
                            disabled={!currentSong}
                        >
                            <Icon
                                icon="material-symbols:download"
                                className={`text-2xl ${!currentSong ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`}
                            />
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Download Song
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoggedInContainer;
