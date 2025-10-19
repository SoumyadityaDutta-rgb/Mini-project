import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import LoggedInContainer from "../containers/LoggedInContainer";
import AudiobookCard from "../components/shared/AudiobookCard";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";

const Audiobooks = () => {
    const [audiobooks, setAudiobooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAudiobooks = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log("Fetching audiobooks...");
                const response = await makeAuthenticatedGETRequest("/audiobook/get/all");
                console.log("Audiobooks response:", response);
                
                if (!response || response.error) {
                    throw new Error(response?.error || "Failed to fetch audiobooks");
                }
                
                const audiobooksData = response.data || [];
                console.log("Setting audiobooks:", audiobooksData);
                setAudiobooks(audiobooksData);
            } catch (err) {
                console.error("Error fetching audiobooks:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAudiobooks();
    }, []);

    return (
        <LoggedInContainer curActiveScreen="audiobooks">
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Audiobooks</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate("/upload")}
                            className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-400 transition-colors flex items-center space-x-2"
                        >
                            <Icon icon="material-symbols:add" className="text-xl" />
                            <span>Upload Song</span>
                        </button>
                        <button
                            onClick={() => navigate("/upload-audiobook")}
                            className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-400 transition-colors flex items-center space-x-2"
                        >
                            <Icon icon="material-symbols:add" className="text-xl" />
                            <span>Upload Audiobook</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-gray-400 text-lg">Loading audiobooks...</div>
                ) : error ? (
                    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">
                        {error}
                    </div>
                ) : audiobooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {audiobooks.map((audiobook) => (
                            <AudiobookCard
                                key={audiobook._id}
                                info={audiobook}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                        <Icon icon="ph:book-open" className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-white text-lg mb-2">No audiobooks yet</p>
                        <p className="text-gray-400 mb-6">Upload your first audiobook to get started!</p>
                    </div>
                )}
            </div>
        </LoggedInContainer>
    );
};

export default Audiobooks; 