import {useState, useEffect, useContext} from "react";
import SingleSongCard from "../components/shared/SingleSongCard";
import {makeAuthenticatedGETRequest} from "../utils/serverHelpers";
import LoggedInContainer from "../containers/LoggedInContainer";
import songContext from "../contexts/songContext";

const MyMusic = () => {
    const [songData, setSongData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    
    const {currentSong, setCurrentSong, setCurrentPlaylist, setCurrentIndex} = useContext(songContext);

    const getData = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
            if (response.err) {
                setError(response.err);
                return;
            }
            setSongData(response.data || []);
            // Set the current playlist when songs are loaded
            setCurrentPlaylist(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch songs");
            console.error("Error fetching songs:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [setCurrentPlaylist]);

    const playSong = (song, index) => {
        setCurrentSong(song);
        setCurrentIndex(index);
    };

    const handleSongDelete = (deletedSongId) => {
        console.log("Handling song delete:", { deletedSongId, currentSongId: currentSong?._id });
        
        // Remove the song from the local state
        const updatedSongs = songData.filter(song => song._id !== deletedSongId);
        setSongData(updatedSongs);
        setCurrentPlaylist(updatedSongs);

        // If the deleted song was playing, stop it
        if (currentSong && currentSong._id === deletedSongId) {
            setCurrentSong(null);
            setCurrentIndex(-1);
        }
    };

    return (
        <LoggedInContainer curActiveScreen="myMusic">
            <div className="flex items-center justify-between pt-8 mb-8">
                <div className="text-white text-2xl font-semibold">
                    My Songs
                </div>
                <button
                    onClick={() => window.location.href = '/upload'}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full shadow-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    Upload Song
                </button>
            </div>
            <div className="space-y-4 pr-4">
                {isLoading ? (
                    <div className="text-gray-400 text-lg">Loading songs...</div>
                ) : error ? (
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</div>
                ) : songData && songData.length > 0 ? (
                    songData.map((item, index) => (
                        <SingleSongCard 
                            key={item._id} 
                            info={item} 
                            playSound={() => playSong(item, index)} 
                            setAddToPlaylistModalOpen={setAddToPlaylistModalOpen}
                            onDelete={handleSongDelete}
                        />
                    ))
                ) : (
                    <div className="text-gray-400 text-lg bg-gray-800/50 p-8 rounded-lg text-center">
                        No songs found. Try uploading some music!
                    </div>
                )}
            </div>
        </LoggedInContainer>
    );
};

export default MyMusic;