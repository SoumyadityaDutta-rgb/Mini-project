/**
 * AUDIOBOOK UPLOAD PAGE
 * 
 * This component handles the upload and management of audiobook files to the platform.
 * 
 * WHAT THIS FILE DOES:
 * - Provides form for uploading new audiobooks with metadata
 * - Handles file upload to cloud storage (Cloudinary)
 * - Manages audiobook metadata (title, author, narrator, etc.)
 * - Validates uploaded files and form data
 * - Provides preview and editing capabilities
 * - Manages upload progress and error handling
 * 
 
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import CloudinaryUpload from "../components/shared/CloudinaryUpload";
import TextInput from "../components/shared/TextInput";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelpers";
import LoggedInContainer from "../containers/LoggedInContainer";

const UploadAudiobook = () => {
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [narrator, setNarrator] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [audioFile, setAudioFile] = useState("");
    const [duration, setDuration] = useState(0);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [uploadedThumbnailName, setUploadedThumbnailName] = useState("");
    const [chapters, setChapters] = useState([{ id: Date.now(), name: "", startTime: "", endTime: "" }]);
    const navigate = useNavigate();

    const calculateDuration = (url) => {
        const audio = new Audio();
        audio.src = url;
        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });
    };

    const handleAudioUpload = (url, fileName) => {
        setAudioFile(url);
        setUploadedFileName(fileName);
        calculateDuration(url);
    };

    const handleThumbnailUpload = (url, fileName) => {
        setThumbnail(url);
        setUploadedThumbnailName(fileName);
    };

    const addChapter = () => {
        setChapters([...chapters, { id: Date.now(), name: "", startTime: "", endTime: "" }]);
    };

    const updateChapter = (id, field, value) => {
        const updatedChapters = chapters.map((chapter) => {
            if (chapter.id === id) {
                return { ...chapter, [field]: value };
            }
            return chapter;
        });
        setChapters(updatedChapters);
    };

    const removeChapter = (id) => {
        const updatedChapters = chapters.filter((chapter) => chapter.id !== id);
        setChapters(updatedChapters);
    };

    const submitAudiobook = async () => {
        try {
            if (!name.trim()) return alert("Please enter an audiobook name");
            if (!author.trim()) return alert("Please enter an author name");
            if (!narrator.trim()) return alert("Please enter a narrator name");
            if (!description.trim()) return alert("Please enter a description");
            if (!genre.trim()) return alert("Please enter a genre");
            if (!thumbnail) return alert("Please upload a thumbnail image");
            if (!audioFile) return alert("Please upload an audio file");

            const validChapters = chapters
                .filter(chapter => chapter.name.trim())
                .map(chapter => ({
                    ...chapter,
                    startTime: Number(chapter.startTime),
                    endTime: Number(chapter.endTime)
                }));
            if (validChapters.length === 0) {
                return alert("Please add at least one chapter");
            }

            const data = {
                name: name.trim(),
                author: author.trim(),
                narrator: narrator.trim(),
                description: description.trim(),
                genre: genre.trim(),
                thumbnail,
                audioFile,
                duration,
                chapters: validChapters
            };

            const response = await makeAuthenticatedPOSTRequest("/audiobook/create", data);

            if (response.error) {
                alert(response.error);
                return;
            }

            alert("Audiobook uploaded successfully!");
            navigate("/audiobooks");
        } catch (error) {
            console.error("Error uploading audiobook:", error);
            alert("Failed to upload audiobook: " + error.message);
        }
    };

    return (
        <LoggedInContainer>
            <div className="p-8 pt-0">
                <div className="text-2xl font-bold mb-8 text-white">Upload an Audiobook</div>
                <div className="flex flex-col space-y-4">
                    <TextInput label="Name" placeholder="Audiobook name" value={name} setValue={setName} />
                    <TextInput label="Author" placeholder="Author name" value={author} setValue={setAuthor} />
                    <TextInput label="Narrator" placeholder="Narrator name" value={narrator} setValue={setNarrator} />
                    <div>
                        <label className="text-white mb-2 inline-block">Description</label>
                        <TextInput placeholder="Audiobook description" value={description} setValue={setDescription} className="h-32" />
                    </div>
                    <TextInput label="Genre" placeholder="Audiobook genre" value={genre} setValue={setGenre} />

                    <div>
                        <label className="text-white mb-2 inline-block">Thumbnail</label>
                        {uploadedThumbnailName ? (
                            <div className="bg-gray-800 text-white rounded-lg p-3 w-1/3">{uploadedThumbnailName}</div>
                        ) : (
                            <CloudinaryUpload setUrl={handleThumbnailUpload} setName={setUploadedThumbnailName} type="image" />
                        )}
                    </div>

                    <div>
                        <label className="text-white mb-2 inline-block">Audio File</label>
                        {uploadedFileName ? (
                            <div className="bg-gray-800 text-white rounded-lg p-3 w-1/3">{uploadedFileName}</div>
                        ) : (
                            <CloudinaryUpload setUrl={handleAudioUpload} setName={setUploadedFileName} type="audio" />
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-white">Chapters</label>
                            <button onClick={addChapter} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                Add Chapter
                            </button>
                        </div>
                        <div className="space-y-4">
                            {chapters.map((chapter) => (
                                <div key={chapter.id} className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg">
                                    <TextInput placeholder="Chapter name" value={chapter.name} setValue={(value) => updateChapter(chapter.id, 'name', value)} />
                                    <TextInput type="number" placeholder="Start time (seconds)" value={chapter.startTime} setValue={(value) => updateChapter(chapter.id, 'startTime', value)} />
                                    <TextInput type="number" placeholder="End time (seconds)" value={chapter.endTime} setValue={(value) => updateChapter(chapter.id, 'endTime', value)} />
                                    <button onClick={() => removeChapter(chapter.id)} className="text-red-500 hover:text-red-400">
                                        <Icon icon="mdi:delete" className="text-2xl" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors" onClick={submitAudiobook}>
                            Upload Audiobook
                        </button>
                    </div>
                </div>
            </div>
        </LoggedInContainer>
    );
};

export default UploadAudiobook;
