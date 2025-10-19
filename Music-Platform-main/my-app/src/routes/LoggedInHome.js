/**
 * AUTHENTICATED USER HOME PAGE
 * 
 * This is the main dashboard page that users see after logging in.
 * 
 * WHAT THIS FILE DOES:
 
 * - Shows user's playlists and audiobooks
 * - Provides quick access to upload new content

 * - Manages user's music library overview
 * 
 
 */

import { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import songContext from "../contexts/songContext";
import LoggedInContainer from "../containers/LoggedInContainer";
import { useNavigate } from "react-router-dom";
import "../styles/scrollbar.css";
import "../styles/animations.css";

const PlayIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-5 h-5"
    >
        <path d="M8 5v14l11-7z" />
    </svg>
);

const LoggedInHome = ({ openMessages, messagesActive }) => {
    const [yourMusic, setYourMusic] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [audiobooks, setAudiobooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [greeting, setGreeting] = useState("");
    const { currentSong, setCurrentSong } = useContext(songContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch all data in parallel
                const [musicResponse, playlistsResponse, audiobooksResponse] = await Promise.all([
                    makeAuthenticatedGETRequest("/song/get/mysongs"),
                    makeAuthenticatedGETRequest("/playlist/get/me"),
                    makeAuthenticatedGETRequest("/audiobook/get/all")
                ]);

                if (musicResponse.err) throw new Error(musicResponse.err);
                if (playlistsResponse.err) throw new Error(playlistsResponse.err);
                if (audiobooksResponse.err) throw new Error(audiobooksResponse.err);

                setYourMusic(musicResponse.data || []);
                setPlaylists(playlistsResponse.data || []);
                setAudiobooks(audiobooksResponse.data || []);

                // Set greeting based on time of day
                const hour = new Date().getHours();
                if (hour < 12) setGreeting("Good Morning");
                else if (hour < 18) setGreeting("Good Afternoon");
                else setGreeting("Good Evening");

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const playSong = (song, songs, index) => {
        setCurrentSong({ song, songs, index });
    };

    const SectionHeader = ({ title, showAll = false, onShowAll }) => (
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {showAll && (
                <button 
                    onClick={onShowAll}
                    className="text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-300"
                >
                    Show all
                </button>
            )}
        </div>
    );

    const Card = ({ info, playlist, index, type = 'song' }) => {
        if (type === 'playlist') {
    return (
                <div 
                    className="group relative p-3 rounded-md bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
                    onClick={() => navigate(`/playlist/${info._id}`)}
                >
                    <div className="mb-4">
                        <div className="relative">
                            <img 
                                src={info.thumbnail} 
                                alt={info.name}
                                className="w-full aspect-square object-cover rounded-md shadow-lg"
                            />
                            <button 
                                className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (info.songs && info.songs.length > 0) {
                                        playSong(info.songs[0], info.songs, 0);
                                    }
                                }}
                            >
                                <PlayIcon />
                            </button>
                        </div>
                    </div>
                    <div className="min-h-[44px]">
                        <h3 className="text-white font-semibold text-sm mb-1 truncate">{info.name}</h3>
                        <p className="text-gray-400 text-xs line-clamp-2">
                            {info.songs?.length || 0} songs
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div 
                className="group relative p-3 rounded-md bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
                onClick={() => playSong(info, playlist, index)}
            >
                <div className="mb-4">
                    <div className="relative">
                        <img 
                            src={info.thumbnail} 
                            alt={info.name}
                            className="w-full aspect-square object-cover rounded-md shadow-lg"
                        />
                        <button 
                            className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                playSong(info, playlist, index);
                            }}
                        >
                            <PlayIcon />
                        </button>
                    </div>
                </div>
                <div className="min-h-[44px]">
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">{info.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2">
                        {info.artist?.firstName} {info.artist?.lastName}
                    </p>
            </div>
        </div>
    );
};

const AudiobookCard = ({ info }) => {
    return (
        <div 
            className="group relative p-3 rounded-md bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
            onClick={() => {/* Book click handler */}}
        >
            <div className="mb-4">
                <div className="relative">
                    <img 
                        src={info.thumbnail} 
                        alt={info.name}
                        className="w-full aspect-[3/4] object-cover rounded-md shadow-lg"
                    />
                    <button 
                        className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Book play/read handler
                        }}
                    >
                        <Icon icon="mdi:book-open-page-variant" className="text-black text-xl" />
                    </button>
                </div>
            </div>
            <div className="min-h-[44px]">
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{info.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                    {info.author}
                </p>
            </div>
        </div>
    );
};

    if (isLoading) {
        return (
            <LoggedInContainer openMessages={openMessages} messagesActive={messagesActive}>
                <div className="px-6 py-4 bg-victor-dark min-h-screen">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-victor-card rounded w-48"></div>
                        {[1, 2, 3].map((section) => (
                            <div key={`section-${section}`} className="space-y-4">
                                <div className="h-7 bg-victor-card rounded w-32"></div>
                                <div className="flex space-x-4">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div key={`item-${section}-${item}`} className="min-w-[160px] max-w-[160px] space-y-3">
                                            <div className="aspect-square bg-victor-card rounded"></div>
                                            <div className="h-3 bg-victor-card rounded w-3/4"></div>
                                            <div className="h-2 bg-victor-card rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    if (error) {
        return (
            <LoggedInContainer openMessages={openMessages} messagesActive={messagesActive}>
                <div className="px-6 py-4 bg-victor-dark min-h-screen">
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    return (
        <LoggedInContainer curActiveScreen="home" openMessages={openMessages} messagesActive={messagesActive}>
            <div className="p-8">
                {/* Enhanced Welcome Section */}
                <div className="mb-16">
                    <div className="relative py-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-violet-900/20 blur-xl"></div>
                        <div className="relative flex flex-col items-center">
                            <h1 className="text-7xl font-bold animate-fade-in" style={{
                                background: 'linear-gradient(to right, #c084fc, #818cf8, #60a5fa)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 40px rgba(192, 132, 252, 0.2)',
                            }}>
                                Welcome to Victor
                            </h1>
                            <div className="h-0.5 w-40 mt-2 bg-gradient-to-r from-purple-500 via-blue-500 to-violet-500 rounded-full animate-pulse"></div>
                            <h2 className="mt-6 text-2xl text-gray-300 font-light animate-fade-in-delayed tracking-wider" style={{
                                fontFamily: "'Segoe UI', system-ui, sans-serif",
                                letterSpacing: '0.05em'
                            }}>
                                <span dangerouslySetInnerHTML={{ __html: greeting }} />
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Your Music Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Icon 
                                icon="material-symbols:library-music-rounded" 
                                className="text-3xl text-purple-500"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))' }}
                            />
                            <h2 className="text-2xl font-bold text-white">Your Music</h2>
                        </div>
                        <span 
                            onClick={() => navigate('/myMusic')}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition duration-300"
                        >
                            Show all
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {yourMusic.map((song, index) => (
                            <Card 
                                key={song._id}
                                info={song}
                                playlist={yourMusic}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Your Playlists Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Icon 
                                icon="material-symbols:queue-music-rounded" 
                                className="text-3xl text-blue-500"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' }}
                            />
                            <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
                        </div>
                        <span 
                            onClick={() => navigate('/library')}
                            className="text-sm text-gray-400 cursor-pointer hover:text-white transition duration-300"
                        >
                            Show all
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {playlists.slice(0, 6).map((playlist) => (
                            <Card 
                                key={playlist._id}
                                info={playlist}
                                type="playlist"
                            />
                        ))}
                    </div>
                </div>

                {/* Audiobooks Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Icon 
                                icon="material-symbols:auto-stories-rounded" 
                                className="text-3xl text-green-500"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))' }}
                            />
                            <h2 className="text-2xl font-bold text-white">Audiobooks</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate('/upload-audiobook')}
                                className="text-sm text-green-500 hover:text-green-400 transition-colors duration-200"
                            >
                                Upload Audiobook
                            </button>
                            {audiobooks.length > 0 && (
                                <button 
                                    onClick={() => navigate('/audiobooks')}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                >
                                    Show all
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {audiobooks.length > 0 ? (
                            audiobooks.slice(0, 6).map((audiobook) => (
                                <AudiobookCard 
                                    key={audiobook._id}
                                    info={audiobook}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-lg">
                                <Icon icon="ph:book-open" className="text-6xl text-gray-400 mx-auto mb-4" />
                                <p className="text-white text-lg mb-2">No audiobooks yet</p>
                                <p className="text-gray-400 mb-6">Upload your first audiobook to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LoggedInContainer>
    );
};

// Update the greeting text with styled evening
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good <span style='font-size: 1.2em; font-weight: 500; color: #818cf8'>E</span>vening";
};

export default LoggedInHome;