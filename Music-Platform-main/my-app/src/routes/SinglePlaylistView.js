import {useEffect, useState, useContext} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {makeAuthenticatedGETRequest, makeAuthenticatedDELETERequest} from "../utils/serverHelpers";
import SingleSongCard from "../components/shared/SingleSongCard";
import songContext from "../contexts/songContext";
import {Icon} from "@iconify/react";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";

const SinglePlaylistView = ({handleAddToPlaylist}) => {
    const [playlistDetails, setPlaylistDetails] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const {playlistId} = useParams();
    const {setCurrentSong, setCurrentPlaylist, setCurrentIndex, setIsPaused} = useContext(songContext);
    const navigate = useNavigate();

    const formatTotalDuration = (songs) => {
        if (!songs || songs.length === 0) return '0 min';
        
        const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    };

    const fetchPlaylistData = async () => {
        try {
            setIsLoading(true);
            setError("");
            
            // Get current user first
            const userResponse = await makeAuthenticatedGETRequest("/auth/current-user");
            if (!userResponse || userResponse.error) {
                console.error("Failed to fetch user:", userResponse?.error);
                setError("Failed to authenticate user");
                return;
            }

            // Then get playlist details
            const response = await makeAuthenticatedGETRequest(
                "/playlist/get/playlist/" + playlistId
            );
            
            console.log("Raw playlist response:", response); // Debug log
            
            if (response.err) {
                console.error("Playlist error:", response.err);
                setError(response.err);
                return;
            }
            
            if (!response || !response._id) {
                console.error("Invalid playlist response:", response);
                setError("Invalid playlist data received");
                return;
            }
            
            // Ensure we have songs array and it's populated
            const playlistData = {
                ...response,
                songs: Array.isArray(response.songs) ? response.songs : []
            };
            
            console.log("Processed playlist data:", playlistData); // Debug log
            
            setPlaylistDetails(playlistData);
            
            // Set this playlist as the current playlist for continuous playback
            if (playlistData.songs && playlistData.songs.length > 0) {
                setCurrentPlaylist(playlistData.songs);
            }
            
            // Check if current user is the owner
            if (userResponse._id === response.owner._id) {
                setIsOwner(true);
            }
        } catch (err) {
            console.error("Error fetching playlist:", err);
            setError("Failed to fetch playlist details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylistData();
    }, [playlistId]);

    // Add focus refresh
    useEffect(() => {
        const handleFocus = () => {
            fetchPlaylistData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Add visibility refresh
    useEffect(() => {
        let timeoutId;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Add a small delay to ensure any backend operations are complete
                timeoutId = setTimeout(fetchPlaylistData, 500);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const deletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await makeAuthenticatedDELETERequest(
                "/playlist/delete/" + playlistId
            );
            if (response.error) {
                alert(response.error);
                return;
            }
            alert("Playlist deleted successfully!");
            navigate("/library");
        } catch (error) {
            console.error("Error deleting playlist:", error);
            alert("Failed to delete playlist. Please try again.");
        }
    };

    // Function to play a song from the playlist
    const playSong = (song, index) => {
        setCurrentSong(song);
        setCurrentIndex(index);
    };

    if (isLoading) {
        return (
            <div className="text-white flex items-center justify-center pt-8">
                <div className="animate-spin mr-2">
                    <Icon icon="line-md:loading-twotone-loop" className="text-2xl" />
                </div>
                Loading playlist...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 bg-red-500/10 p-4 rounded-lg text-center mt-8">
                <p className="font-semibold">Error loading playlist</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <div className="max-w-5xl mx-auto p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 mb-10">
                    <div className="relative group">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl flex items-center justify-center overflow-hidden">
                            {playlistDetails.thumbnail ? (
                                <img 
                                    src={playlistDetails.thumbnail} 
                                    alt={playlistDetails.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <Icon 
                                    icon="ph:playlist-bold" 
                                    className="text-6xl text-gray-600"
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="uppercase text-xs tracking-widest text-gray-400 mb-2">Playlist</div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight">{playlistDetails.name}</h1>
                        <div className="text-gray-400 text-base mb-4">
                            Created by {playlistDetails.owner?.firstName} {playlistDetails.owner?.lastName}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-gray-400 text-sm">{playlistDetails.songs?.length || 0} songs</span>
                            <span className="text-gray-400 text-sm">• {formatTotalDuration(playlistDetails.songs)}</span>
                        </div>
                        <button 
                            className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                            onClick={() => {
                                if (playlistDetails.songs && playlistDetails.songs.length > 0) {
                                    setCurrentPlaylist(playlistDetails.songs);
                                    setCurrentSong(playlistDetails.songs[0]);
                                    setCurrentIndex(0);
                                    setIsPaused(false);
                                }
                            }}
                            disabled={!playlistDetails.songs || playlistDetails.songs.length === 0}
                        >
                            <div className="flex items-center gap-2">
                                <Icon icon="mdi:play" className="text-xl" />
                                <span>Play</span>
                            </div>
                        </button>
                        {isOwner && (
                            <button 
                                className="ml-4 text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-800/50 transition-all duration-300"
                                onClick={deletePlaylist}
                            >
                                <Icon icon="mdi:delete" className="text-2xl" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="bg-[#181818] rounded-xl shadow-lg overflow-hidden">
                    {playlistDetails.songs && playlistDetails.songs.length > 0 ? (
                        <div>
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-400 text-sm font-semibold border-b border-gray-800 bg-[#181818]">
                                <div className="col-span-1">#</div>
                                <div className="col-span-5">Title</div>
                                <div className="col-span-4">Artist</div>
                                <div className="col-span-2 text-right">Duration</div>
                            </div>
                            <div>
                                {playlistDetails.songs.map((item, index) => (
                                    <div
                                        key={item._id}
                                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#232323] transition-colors duration-200 group cursor-pointer"
                                        onClick={() => playSong(item, index)}
                                    >
                                        <div className="col-span-1 text-gray-500 group-hover:text-green-400 font-mono">{index + 1}</div>
                                        <div className="col-span-5 flex items-center gap-4">
                                            <img src={item.thumbnail} alt={item.name} className="w-12 h-12 rounded-md object-cover shadow-md mr-3" />
                                            <span className="text-white font-medium truncate group-hover:underline">{item.name}</span>
                                        </div>
                                        <div className="col-span-4 text-gray-300 truncate">{item.artist?.firstName} {item.artist?.lastName}</div>
                                        <div className="col-span-2 text-right text-gray-400 font-mono">{Math.floor((item.duration || 0) / 60)}:{String(Math.floor((item.duration || 0) % 60)).padStart(2, '0')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                            <Icon icon="material-symbols:music-note-add" className="text-6xl text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-300 text-lg font-medium">This playlist is empty</p>
                            <p className="text-sm text-gray-400 mt-2">Add some songs to get started!</p>
                        </div>
                    )}
                </div>
            </div>
            {addToPlaylistModalOpen && (
                <AddToPlaylistModal
                    closeModal={() => setAddToPlaylistModalOpen(false)}
                    addSongToPlaylist={handleAddToPlaylist}
                />
            )}
        </div>
    );
};

export default SinglePlaylistView;