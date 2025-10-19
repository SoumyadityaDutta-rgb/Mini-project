/**
 * SONG UPLOAD PAGE
 * 
 * This component handles the upload and management of music files to the platform.
 * 
 * WHAT THIS FILE DOES:
 * - Provides form for uploading new songs with metadata
 * - Handles file upload to cloud storage (Cloudinary)
 * - Manages song metadata (title, artist, genre, etc.)
 * - Validates uploaded files and form data
 * - Provides preview and editing capabilities
 * - Manages upload progress and error handling
 
 */

import {useState} from "react";
import {Icon} from "@iconify/react";
import spotify_logo from "../assets/images/img.jpg";
import CloudinaryUpload from "../components/shared/CloudinaryUpload";
import IconText from "../components/shared/IconText";
import TextInput from "../components/shared/TextInput";
import TextWithHover from "../components/shared/TextWithHover";
import {makeAuthenticatedPOSTRequest} from "../utils/serverHelpers";
import {useNavigate} from "react-router-dom";
import LoggedInContainer from "../containers/LoggedInContainer";

const UploadSong = () => {
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [uploadedSongFileName, setUploadedSongFileName] = useState();
    const [uploadedThumbnailName, setUploadedThumbnailName] = useState();
    const [duration, setDuration] = useState(0);
    const navigate = useNavigate();

    const calculateDuration = (url) => {
        const audio = new Audio();
        audio.src = url;
        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });
    };

    const handleSongUpload = (url, fileName) => {
        setPlaylistUrl(url);
        setUploadedSongFileName(fileName);
        calculateDuration(url);
    };

    const submitSong = async () => {
        try {
            // Validate inputs
            if (!name.trim()) {
                alert("Please enter a song name");
                return;
            }
            if (!author.trim()) {
                alert("Please enter an author name");
                return;
            }
            if (!thumbnail) {
                alert("Please upload a thumbnail image");
                return;
            }
            if (!playlistUrl) {
                alert("Please upload a song file");
                return;
            }

            const data = {
                name: name.trim(),
                author: author.trim(),
                thumbnail, 
                track: playlistUrl,
                duration
            };
            console.log("Submitting song data:", data);
            
            const response = await makeAuthenticatedPOSTRequest(
                "/song/create",
                data
            );
            
            console.log("Server response:", response);

            if (response.err) {
                console.error("Error from server:", response.err);
                alert(response.err.details || response.err || "Failed to create song");
                return;
            }

            if (!response._id) {
                console.error("Invalid response:", response);
                alert("Failed to create song. Please try again.");
                return;
            }
            
            alert("Song uploaded successfully!");
            navigate("/home");
        } catch (error) {
            console.error("Error submitting song:", error);
            alert("Failed to submit song: " + (error.message || "Unknown error occurred"));
        }
    };

    return (
        <LoggedInContainer curActiveScreen="upload">
            <div className="content p-8 pt-0 overflow-auto bg-gradient-to-b from-gray-900 to-black">
                <div className="text-2xl font-semibold mb-5 text-white mt-8">
                    Upload Your Music
                </div>
                <div className="w-2/3 flex space-x-3">
                    <div className="w-1/2">
                        <TextInput
                            label="Name"
                            labelClassName={"text-white"}
                            placeholder="Song name"
                            value={name}
                            setValue={setName}
                        />
                    </div>
                    <div className="w-1/2">
                        <TextInput
                            label="Author"
                            labelClassName={"text-white"}
                            placeholder="Author name"
                            value={author}
                            setValue={setAuthor}
                        />
                    </div>
                </div>
                <div className="w-2/3 flex space-x-3 mt-4">
                    <div className="w-full">
                        {uploadedThumbnailName ? (
                            <div>
                                <label className="text-white mb-2 block">Thumbnail</label>
                                <div className="bg-gray-800 text-white rounded-full p-3 w-full overflow-hidden hover:bg-gray-700 transition-colors">
                                    {uploadedThumbnailName}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-white mb-2 block">Thumbnail</label>
                                <CloudinaryUpload
                                    setUrl={setThumbnail}
                                    setName={setUploadedThumbnailName}
                                    type="image"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="py-5">
                    {uploadedSongFileName ? (
                        <div className="bg-gray-800 text-white rounded-full p-3 w-1/3 hover:bg-gray-700 transition-colors">
                            {uploadedSongFileName.substring(0, 35)}...
                        </div>
                    ) : (
                        <CloudinaryUpload
                            setUrl={handleSongUpload}
                            setName={setUploadedSongFileName}
                            type="audio"
                        />
                    )}
                </div>
                <div
                    className="bg-green-500 w-40 flex items-center justify-center p-4 rounded-full cursor-pointer font-semibold text-white hover:bg-green-600 transition-colors"
                    onClick={submitSong}
                >
                    Submit Song
                </div>
            </div>
        </LoggedInContainer>
    );
};

export default UploadSong;