import {useState} from "react";
import TextInput from "../components/shared/TextInput";
import {makeAuthenticatedPOSTRequest} from "../utils/serverHelpers";
import {Icon} from "@iconify/react";

const CreatePlaylistModal = ({closeModal}) => {
    const [playlistName, setPlaylistName] = useState("");
    const [playlistThumbnail, setPlaylistThumbnail] = useState("https://www.videostudiopro.com/static/vsp/images/pages/seo/tips/audio/add-music-to-video.jpg");
    const [imagePreview, setImagePreview] = useState("https://www.videostudiopro.com/static/vsp/images/pages/seo/tips/audio/add-music-to-video.jpg");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCustomUpload, setIsCustomUpload] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError("Please upload an image file");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPlaylistThumbnail(reader.result);
            setImagePreview(reader.result);
            setIsCustomUpload(true);
            setError("");
        };
        reader.readAsDataURL(file);
    };

    const useDefaultImage = () => {
        const defaultImage = "https://www.videostudiopro.com/static/vsp/images/pages/seo/tips/audio/add-music-to-video.jpg";
        setPlaylistThumbnail(defaultImage);
        setImagePreview(defaultImage);
        setIsCustomUpload(false);
        setError("");
    };

    const createPlaylist = async () => {
        if (!playlistName.trim()) {
            setError("Please enter a playlist name");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            
            const response = await makeAuthenticatedPOSTRequest(
                "/playlist/create",
                {
                    name: playlistName,
                    thumbnail: playlistThumbnail,
                    songs: []
                }
            );

            if (response.error) {
                setError(response.error);
                return;
            }

            if (response._id) {
                closeModal();
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
            setError("Failed to create playlist");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="absolute bg-black bg-opacity-50 w-screen h-screen flex justify-center items-center"
            onClick={closeModal}
        >
            <div
                className="bg-gray-900 w-1/3 rounded-md p-8"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="text-white text-lg font-semibold">
                        Create Playlist
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <Icon icon="mdi:close" fontSize={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <TextInput
                            label="Playlist Name"
                            placeholder="Enter playlist name"
                            value={playlistName}
                            setValue={setPlaylistName}
                        />
                    </div>

                    <div>
                        <p className="text-white text-sm mb-2">Playlist Cover Image</p>
                        <div className="flex items-center space-x-4">
                            <div 
                                className={`w-32 h-32 rounded-md flex items-center justify-center border-2 border-dashed transition-colors duration-200 ${
                                    imagePreview ? 'border-transparent' : 'border-gray-600 hover:border-gray-400'
                                } relative group cursor-pointer overflow-hidden`}
                                onClick={() => document.getElementById('playlist-image').click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img 
                                            src={imagePreview} 
                                            alt="Playlist cover" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                            <Icon icon="material-symbols:edit" className="text-white text-2xl" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Icon icon="material-symbols:add-photo-alternate-outline" className="text-gray-400 text-3xl mb-2" />
                                        <p className="text-gray-400 text-sm">Upload Cover</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">
                                    {isCustomUpload ? (
                                        <>
                                            Custom image uploaded
                                            <button
                                                onClick={useDefaultImage}
                                                className="ml-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                            >
                                                Use default image instead
                                            </button>
                                        </>
                                    ) : (
                                        "Using default image. Click the image to upload a custom one."
                                    )}
                                    <br />
                                    File size limit: 5MB
                                </p>
                            </div>
                        </div>
                        <input
                            type="file"
                            id="playlist-image"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 rounded-full text-white hover:text-gray-300 transition-colors duration-200"
                            onClick={closeModal}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full bg-green-500 text-white font-medium hover:bg-green-400 transition-all duration-200 flex items-center ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={createPlaylist}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Icon icon="eos-icons:loading" className="animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;