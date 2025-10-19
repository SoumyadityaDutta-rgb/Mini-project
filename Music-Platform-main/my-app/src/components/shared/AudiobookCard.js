import { useContext, useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import songContext from '../../contexts/songContext';
import { makeAuthenticatedPOSTRequest } from '../../utils/serverHelpers';

const AudiobookCard = ({ info, showProgress = true, allAudiobooks = [] }) => {
    const navigate = useNavigate();
    const { currentSong, setCurrentSong, setCurrentPlaylist, setCurrentIndex } = useContext(songContext);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate progress percentage
    let progress = 0;
    const userId = localStorage.getItem('userId');
    if (info.currentProgress) {
        if (typeof info.currentProgress.get === 'function') {
            // If it's a Map (rare in frontend, but just in case)
            progress = info.currentProgress.get(userId) || 0;
        } else if (typeof info.currentProgress === 'object') {
            // If it's a plain object (most likely)
            progress = info.currentProgress[userId] || 0;
        }
    }
    const progressPercentage = (progress / info.duration) * 100;

    const handlePlay = (e) => {
        e.stopPropagation();
        // Create a song-like object for the audiobook
        const audiobookAsSong = {
            _id: info._id,
            name: info.name,
            thumbnail: info.thumbnail,
            track: info.audioFile,
            artist: {
                firstName: info.author,
                lastName: '',
            },
            duration: info.duration,
            isAudiobook: true,
        };

        // If allAudiobooks is provided, set the full playlist and correct index
        if (Array.isArray(allAudiobooks) && allAudiobooks.length > 0) {
            const playlist = allAudiobooks.map(book => ({
                _id: book._id,
                name: book.name,
                thumbnail: book.thumbnail,
                track: book.audioFile,
                artist: {
                    firstName: book.author,
                    lastName: '',
                },
                duration: book.duration,
                isAudiobook: true,
            }));
            const index = playlist.findIndex(book => book._id === info._id);
            setCurrentSong(audiobookAsSong);
            setCurrentPlaylist(playlist);
            setCurrentIndex(index >= 0 ? index : 0);
        } else {
        setCurrentSong(audiobookAsSong);
        setCurrentPlaylist([audiobookAsSong]);
        setCurrentIndex(0);
        }
    };

    const navigateToDetails = () => {
        navigate(`/audiobook/${info._id}`);
    };

    return (
        <div 
            className="group relative p-4 rounded-md bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={navigateToDetails}
        >
            <div className="relative mb-4">
                <img 
                    src={info.thumbnail} 
                    alt={info.name}
                    className="w-full aspect-[3/4] object-cover rounded-md shadow-lg"
                />
                <button 
                    className={`absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center transform transition-all duration-300 shadow-xl hover:scale-105 hover:bg-green-400 ${
                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    onClick={handlePlay}
                >
                    <Icon icon="mdi:play" className="text-black text-xl" />
                </button>
            </div>
            <div>
                <h3 className="text-white font-semibold text-base mb-1 truncate">{info.name}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    by {info.author}
                </p>
                <p className="text-gray-500 text-xs mb-2">
                    Narrated by {info.narrator}
                </p>
                {showProgress && progressPercentage > 0 && (
                    <div className="mt-2">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                            {Math.round(progressPercentage)}% complete
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudiobookCard; 