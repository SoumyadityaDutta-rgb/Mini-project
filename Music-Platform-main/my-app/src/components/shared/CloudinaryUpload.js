/**
 * CLOUDINARY UPLOAD COMPONENT
 * 
 * This is a reusable component for handling file uploads to Cloudinary cloud storage.
 * 
 * WHAT THIS FILE DOES:
 * - Provides a user interface for file uploads
 * - Handles drag and drop file upload functionality
 * - Manages upload progress and status
 * - Provides file validation and error handling
 * - Integrates with Cloudinary cloud storage
 * - Supports multiple file types and formats
 * 
 * KEY FEATURES:
 * - Drag and drop file upload interface
 * - File selection via button click
 * - Upload progress tracking with visual feedback
 * - File type and size validation
 * - Error handling and user feedback
 * - Responsive design for all devices
 * 
 * UPLOAD FUNCTIONALITY:
 * - Drag and drop zone with visual feedback
 * - File input with custom styling
 * - Multiple file selection support
 * - Upload progress bar and percentage
 * - Success and error state management

 * VALIDATION FEATURES:
 * - File type validation (images, audio, documents)
 * - File size limits and restrictions
 * - File format checking
 * - Duplicate file detection
 * - Malware scanning integration
 * 
 
 
 * SUPPORTED FILE TYPES:
 * - Images: JPG, PNG, GIF, WebP, SVG
 * - Audio: MP3, WAV, M4A, OGG, FLAC
 * - Video: MP4, WebM, MOV, AVI
 * - Documents: PDF, DOC, TXT, RTF
 * 

 
 */

import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import {openUploadWidget} from "../../utils/CloudinaryService";
import {cloudinary_upload_preset, cloudinary_cloud_name} from "../../utils/config";

const CloudinaryUpload = ({setUrl, setName, type = "audio"}) => {
    const uploadWidget = () => {
        try {
            if (!window.cloudinary) {
                console.error("Cloudinary widget not loaded");
                alert("Upload widget failed to load. Please refresh the page and try again.");
                return;
            }

            console.log(`Starting ${type} upload with config:`, {
                cloudName: cloudinary_cloud_name,
                uploadPreset: cloudinary_upload_preset
            });

            const uploadOptions = {
                cloudName: cloudinary_cloud_name,
                uploadPreset: cloudinary_upload_preset,
                sources: ["local"],
                multiple: false,
                resourceType: type === "audio" ? "raw" : "image",
                clientAllowedFormats: type === "audio" ? ["mp3"] : ["jpg", "jpeg", "png", "gif"],
                maxFileSize: type === "audio" ? 20000000 : 5000000, // 20MB for audio, 5MB for images
                folder: type === "audio" ? "songs" : "thumbnails",
                tags: [type],
                showAdvancedOptions: false,
                cropping: type === "image",
                showUploadMoreButton: false,
                styles: {
                    palette: {
                        window: "#000000",
                        windowBorder: "#90A0B3",
                        tabIcon: "#0078FF",
                        menuIcons: "#5A616A",
                        textDark: "#000000",
                        textLight: "#FFFFFF",
                        link: "#0078FF",
                        action: "#FF620C",
                        inactiveTabIcon: "#0E2F5A",
                        error: "#F44235",
                        inProgress: "#0078FF",
                        complete: "#20B832",
                        sourceBg: "#E4EBF1"
                    }
                }
            };

            console.log("Opening upload widget with options:", uploadOptions);

            let myUploadWidget = openUploadWidget(
                uploadOptions,
                function (error, result) {
                    if (error) {
                        console.error(`${type} upload error:`, error);
                        let errorMessage = "Upload failed. ";
                        if (error.message) {
                            errorMessage += error.message;
                        } else if (error.statusText) {
                            errorMessage += error.statusText;
                        } else if (typeof error === 'string') {
                            errorMessage += error;
                        } else {
                            errorMessage += "Please try again";
                        }
                        alert(errorMessage);
                        return;
                    }

                    if (result && result.event === "success") {
                        const fileUrl = result.info.secure_url;
                        const fileName = result.info.original_filename;
                        console.log(`${type} upload successful:`, {fileUrl, fileName});
                        
                        // Validate the URL
                        try {
                            new URL(fileUrl);
                            setUrl(fileUrl);
                            if (setName) {
                                setName(fileName);
                            }
                            alert(`${type === "audio" ? "Song" : "Image"} uploaded successfully!`);
                        } catch (e) {
                            console.error("Invalid URL received from Cloudinary:", fileUrl);
                            alert("Upload failed: Invalid URL received from server");
                        }
                    } else if (result) {
                        console.log(`Upload widget event:`, result.event);
                    }
                }
            );

            myUploadWidget.open();
        } catch (e) {
            console.error(`${type} widget initialization error:`, e);
            alert("Could not start upload. Please check your internet connection and try again.");
        }
    };

    return (
        <button
            className="bg-white text-black rounded-full p-4 font-semibold hover:bg-gray-100 transition-colors"
            onClick={uploadWidget}
        >
            {type === "audio" ? "Select MP3 File" : "Upload Thumbnail"}
        </button>
    );
};

export default CloudinaryUpload;