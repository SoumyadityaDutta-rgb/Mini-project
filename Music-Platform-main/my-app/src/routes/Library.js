import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import LoggedInContainer from "../containers/LoggedInContainer";
import {makeAuthenticatedGETRequest} from "../utils/serverHelpers";
import {Icon} from "@iconify/react";

const Library = () => {
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPlaylists = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await makeAuthenticatedGETRequest("/playlist/get/me");
            
            if (response.err) {
                throw new Error(response.err);
            }
            
            setMyPlaylists(response.data || []);
        } catch (err) {
            console.error("Failed to fetch playlists:", err);
            setError(err.message);
            setMyPlaylists([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPlaylists();
    }, []);

    // Refresh when component gains focus
    useEffect(() => {
        const handleFocus = () => {
            fetchPlaylists();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const navigateToPlaylist = (playlistId) => {
        navigate("/playlist/" + playlistId);
    };

    return (
        <LoggedInContainer curActiveScreen="library">
            <div className="p-8">
                <div className="text-2xl font-bold text-white mb-8">Your Library</div>
                
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Icon icon="eos-icons:loading" className="text-4xl text-white animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                        {error}
                        <button 
                            onClick={fetchPlaylists}
                            className="ml-4 text-sm underline hover:text-red-400"
                        >
                            Try again
                        </button>
                    </div>
                ) : myPlaylists.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                        <Icon icon="ph:playlist-bold" className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-white text-lg mb-2">No playlists yet</p>
                        <p className="text-gray-400 mb-6">Create your first playlist to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {myPlaylists.map((playlist) => (
                            <div
                                key={playlist._id}
                                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 cursor-pointer group"
                                onClick={() => navigateToPlaylist(playlist._id)}
                            >
                                <div className="aspect-square bg-gray-700 rounded-lg mb-4 overflow-hidden">
                                    {playlist.thumbnail ? (
                                        <img
                                            src={playlist.thumbnail}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon icon="ph:playlist-bold" className="text-4xl text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-white font-semibold mb-1 truncate group-hover:text-green-500">
                                    {playlist.name}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {playlist.songs?.length || 0} songs
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </LoggedInContainer>
    );
};

export default Library;