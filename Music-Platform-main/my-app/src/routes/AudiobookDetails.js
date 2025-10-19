import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from "../utils/serverHelpers";
import songContext from "../contexts/songContext";

const AudiobookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [audiobook, setAudiobook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentSong, setCurrentSong, setCurrentPlaylist, setCurrentIndex } = useContext(songContext);

    useEffect(() => {
        const fetchAudiobook = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await makeAuthenticatedGETRequest(`/audiobook/get/${id}`);
                if (response.error) {
                    throw new Error(response.error);
                }
                setAudiobook(response);
            } catch (err) {
                console.error("Error fetching audiobook:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudiobook();
    }, [id]);

    const handlePlay = (startTime = 0) => {
        // Create a song-like object for the audiobook
        const audiobookAsSong = {
            _id: audiobook._id,
            name: audiobook.name,
            thumbnail: audiobook.thumbnail,
            track: audiobook.audioFile,
            artist: {
                firstName: audiobook.author,
                lastName: '',
            },
            duration: audiobook.duration,
            isAudiobook: true,
            startTime,
        };

        setCurrentSong(audiobookAsSong);
        setCurrentPlaylist([audiobookAsSong]);
        setCurrentIndex(0);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <LoggedInContainer>
                <div className="p-8 text-white">Loading audiobook details...</div>
            </LoggedInContainer>
        );
    }

    if (error) {
        return (
            <LoggedInContainer>
                <div className="p-8">
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                </div>
            </LoggedInContainer>
        );
    }

    if (!audiobook) {
        return (
            <LoggedInContainer>
                <div className="p-8 text-white">Audiobook not found</div>
            </LoggedInContainer>
        );
    }

    return (
        <LoggedInContainer>
            <div className="p-8">
                <div className="flex space-x-8">
                    {/* Left side - Cover and main info */}
                    <div className="w-1/3">
                        <img
                            src={audiobook.thumbnail}
                            alt={audiobook.name}
                            className="w-full aspect-[3/4] object-cover rounded-lg shadow-xl mb-6"
                        />
                        <button
                            onClick={() => handlePlay()}
                            className="w-full bg-green-500 text-white py-4 rounded-full font-semibold hover:bg-green-400 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Icon icon="mdi:play" className="text-2xl" />
                            <span>Play</span>
                        </button>
                    </div>

                    {/* Right side - Details */}
                    <div className="flex-1 text-white">
                        <h1 className="text-4xl font-bold mb-2">{audiobook.name}</h1>
                        <p className="text-xl text-gray-400 mb-4">by {audiobook.author}</p>
                        <p className="text-gray-500 mb-6">Narrated by {audiobook.narrator}</p>

                        <div className="bg-gray-800/50 p-6 rounded-lg mb-8">
                            <h2 className="text-xl font-semibold mb-4">About this audiobook</h2>
                            <p className="text-gray-300 leading-relaxed">{audiobook.description}</p>
                            <div className="mt-4 flex space-x-8 text-sm text-gray-400">
                                <div>
                                    <p className="font-semibold">Genre</p>
                                    <p>{audiobook.genre}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Length</p>
                                    <p>{formatTime(audiobook.duration)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Released</p>
                                    <p>{new Date(audiobook.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Chapters</h2>
                            <div className="space-y-2">
                                {audiobook.chapters.map((chapter) => (
                                    <div
                                        key={`${chapter.startTime}-${chapter.name}`}
                                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => handlePlay(chapter.startTime)}
                                    >
                                        <div>
                                            <span className="text-gray-400 mr-4">{chapter.name}</span>
                                        </div>
                                        <div className="text-gray-400">
                                            {formatTime(chapter.endTime - chapter.startTime)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LoggedInContainer>
    );
};

export default AudiobookDetails; 