import {useState, useEffect} from "react";
import {makeAuthenticatedGETRequest} from "../utils/serverHelpers";
import {Icon} from "@iconify/react";

const AddToPlaylistModal = ({closeModal, addSongToPlaylist}) => {
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlaylists = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await makeAuthenticatedGETRequest("/playlist/get/me");
            if (response.err) {
                setError(response.err);
                return;
            }
            setMyPlaylists(response.data || []);
        } catch (err) {
            setError("Failed to fetch playlists");
            console.error("Error fetching playlists:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={closeModal}
        >
            <div
                className="bg-gray-900 w-96 rounded-lg p-6 border border-gray-800"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-xl font-semibold">Add to Playlist</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <Icon icon="mdi:close" fontSize={24} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-gray-400 text-center py-8">
                        <Icon icon="eos-icons:loading" className="text-4xl animate-spin mx-auto mb-2" />
                        Loading playlists...
                    </div>
                ) : error ? (
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg text-center">
                        {error}
                        <button 
                            onClick={fetchPlaylists}
                            className="block mx-auto mt-2 text-sm underline hover:text-red-400"
                        >
                            Try again
                        </button>
                    </div>
                ) : myPlaylists.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon icon="ph:playlist-bold" className="text-4xl text-gray-400 mx-auto mb-2" />
                        <div className="text-gray-400">No playlists found</div>
                        <button
                            onClick={closeModal}
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-400 transition-colors duration-200"
                        >
                            Create New Playlist
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {myPlaylists.map((playlist) => (
                            <PlaylistListComponent
                                key={playlist._id}
                                info={playlist}
                                addSongToPlaylist={async (playlistId) => {
                                    await addSongToPlaylist(playlistId);
                                    // Refresh the playlists after adding a song
                                    fetchPlaylists();
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PlaylistListComponent = ({info, addSongToPlaylist}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleAddToPlaylist = async () => {
        if (isAdding) return;
        
        try {
            setIsAdding(true);
            setError("");
            setSuccess(false);
            
            await addSongToPlaylist(info._id);
            setSuccess(true);
            
            // Reset success message after 2 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (error) {
            console.error("Error adding to playlist:", error);
            setError("Failed to add song to playlist");
            
            // Clear error after 3 seconds
            setTimeout(() => {
                setError("");
            }, 3000);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div 
            className={`bg-gray-800 flex items-center justify-between hover:bg-gray-700 cursor-pointer p-3 rounded-md transition-all duration-200 relative ${
                isAdding ? 'opacity-50 pointer-events-none' : ''
            } ${error ? 'border-red-500 border' : ''} ${success ? 'border-green-500 border' : ''}`}
            onClick={handleAddToPlaylist}
        >
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden">
                    {info.thumbnail ? (
                        <img
                            src={info.thumbnail}
                            alt={info.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600">
                            <Icon icon="ph:playlist-bold" className="text-2xl text-gray-400" />
                        </div>
                    )}
                </div>
                <div>
                    <div className="text-white font-semibold text-sm">{info.name}</div>
                    <div className="text-gray-400 text-xs">{info.songs?.length || 0} songs</div>
                </div>
            </div>
            
            {error && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs py-1 px-2 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs py-1 px-2 rounded">
                    Added to playlist!
                </div>
            )}

            <div className="flex items-center space-x-2">
                {isAdding ? (
                    <Icon icon="eos-icons:loading" className="text-xl text-green-500 animate-spin" />
                ) : success ? (
                    <Icon icon="material-symbols:check-circle" className="text-xl text-green-500" />
                ) : (
                    <Icon icon="material-symbols:add" className="text-xl text-gray-400 group-hover:text-white" />
                )}
            </div>
        </div>
    );
};

export default AddToPlaylistModal;