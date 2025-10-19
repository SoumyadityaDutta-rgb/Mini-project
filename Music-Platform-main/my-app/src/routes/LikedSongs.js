import {useState, useEffect, useContext} from "react";
import SingleSongCard from "../components/shared/SingleSongCard";
import {makeAuthenticatedGETRequest} from "../utils/serverHelpers";
import LoggedInContainer from "../containers/LoggedInContainer";
import songContext from "../contexts/songContext";
import {Icon} from "@iconify/react";

const LikedSongs = () => {
    const [songData, setSongData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const {setCurrentPlaylist, setCurrentIndex, setCurrentSong} = useContext(songContext);

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);
                setError("");
                const response = await makeAuthenticatedGETRequest("/song/liked");
                
                if (response.error) {
                    setError(response.error);
                    return;
                }
                
                const songs = response.data || [];
                setSongData(songs);
                setCurrentPlaylist(songs);
            } catch (err) {
                setError(err.message || "Failed to fetch liked songs");
                console.error("Error fetching liked songs:", err);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [setCurrentPlaylist]);

    const playSong = (song, index) => {
        console.log("Playing song at index:", index);
        setCurrentSong(song);
        setCurrentIndex(index);
    };

    const handleSongDelete = (deletedSongId) => {
        // Remove the song from the local state
        const updatedSongs = songData.filter(song => song._id !== deletedSongId);
        setSongData(updatedSongs);
        setCurrentPlaylist(updatedSongs);
    };

    const content = (
        <div className="text-white">
            <div className="flex items-center space-x-4 mb-8 pt-8">
                <div className="w-52 h-52 bg-gradient-to-br from-purple-700 to-blue-300 flex items-center justify-center rounded-lg shadow-lg">
                    <Icon icon="ph:heart-fill" className="text-white" fontSize={64} />
                </div>
                <div>
                    <div className="text-sm font-semibold uppercase">Playlist</div>
                    <h1 className="text-5xl font-bold mt-2 mb-4">Liked Songs</h1>
                    <div className="text-sm text-gray-300">
                        {songData.length} {songData.length === 1 ? 'song' : 'songs'}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-gray-400 text-lg bg-gray-800/50 p-8 rounded-lg text-center">
                        <Icon icon="eos-icons:loading" className="text-4xl animate-spin mx-auto mb-2" />
                        Loading liked songs...
                    </div>
                ) : error ? (
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg text-center">
                        {error}
                    </div>
                ) : songData && songData.length > 0 ? (
                    songData.map((item, index) => (
                        <SingleSongCard 
                            key={item._id} 
                            info={item} 
                            playSound={() => playSong(item, index)}
                            onDelete={handleSongDelete}
                        />
                    ))
                ) : (
                    <div className="text-gray-400 text-lg bg-gray-800/50 p-8 rounded-lg text-center">
                        <Icon icon="ph:heart" className="text-6xl mx-auto mb-4" />
                        <div className="font-semibold text-xl mb-2">Songs you like will appear here</div>
                        <div className="text-sm">Save songs by tapping the heart icon</div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <LoggedInContainer curActiveScreen="liked-songs">
            {content}
        </LoggedInContainer>
    );
};

export default LikedSongs; 