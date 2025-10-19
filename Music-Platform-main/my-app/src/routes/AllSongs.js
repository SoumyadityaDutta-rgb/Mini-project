import { useState, useEffect, useContext } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import LoggedInContainer from "../containers/LoggedInContainer";
import { Icon } from "@iconify/react";
import songContext from "../contexts/songContext";

const AllSongs = () => {
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setCurrentSong, currentSong, setCurrentIndex } = useContext(songContext);

    const getData = async () => {
        try {
            setIsLoading(true);
            const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
            if (response.data) {
                setSongs(response.data);
            }
        } catch (err) {
            console.error("Error fetching songs:", err);
            setError("Failed to load songs. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const playSong = (song, index) => {
        setCurrentSong({ song, songs, index });
    };

    const handleSongDelete = (deletedSongId) => {
        // Remove the song from the local state
        const updatedSongs = songs.filter(song => song._id !== deletedSongId);
        setSongs(updatedSongs);

        // If the deleted song was playing, stop it
        if (currentSong && currentSong._id === deletedSongId) {
            setCurrentSong(null);
            setCurrentIndex(-1);
        }
    };

    const SongCard = ({ info, index }) => (
        <div 
            className="flex items-center bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer rounded-md p-2 group"
            onClick={() => playSong(info, index)}
        >
            <img 
                src={info.thumbnail} 
                alt={info.name}
                className="h-12 w-12 object-cover rounded-md"
            />
            <div className="ml-4 flex-grow">
                <h3 className="text-white font-semibold text-base">{info.name}</h3>
                <p className="text-gray-400 text-sm">
                    {info.artist?.firstName} {info.artist?.lastName}
                </p>
            </div>
            <div className="flex items-center">
                <button 
                    className="w-10 h-10 bg-green-500 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden group-hover:flex shadow-xl hover:scale-105 hover:bg-green-400 mr-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        playSong(info, index);
                    }}
                >
                    <Icon icon="mdi:play" className="text-black text-xl" />
                </button>
                {info.artist && typeof info.artist === 'object' && info.artist._id === localStorage.getItem('userId') && (
                    <button 
                        className="w-10 h-10 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden group-hover:flex hover:bg-gray-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSongDelete(info._id);
                        }}
                    >
                        <Icon icon="mdi:delete" className="text-gray-400 hover:text-red-500 text-xl" />
                    </button>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <LoggedInContainer>
                <div className="px-6 py-4 bg-victor-dark min-h-screen">
                    <h1 className="text-2xl font-bold text-white mb-6">All Songs</h1>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="h-16 bg-[#282828] rounded-md"></div>
                        ))}
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    if (error) {
        return (
            <LoggedInContainer>
                <div className="px-6 py-4 bg-victor-dark min-h-screen">
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    return (
        <LoggedInContainer>
            <div className="px-6 py-4 bg-victor-dark min-h-screen">
                <h1 className="text-2xl font-bold text-white mb-6">All Songs</h1>
                <div className="space-y-2">
                    {songs.map((song, index) => (
                        <SongCard 
                            key={song._id}
                            info={song}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </LoggedInContainer>
    );
};

export default AllSongs; 