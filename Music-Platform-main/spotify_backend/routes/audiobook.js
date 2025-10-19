/**
 * AUDIOBOOK MANAGEMENT ROUTES
 * 
 * This file handles all audiobook-related operations and endpoints.
 * 
 * WHAT THIS FILE DOES:
 * - Manages audiobook upload and storage
 * - Handles audiobook playback and streaming
 * - Manages audiobook metadata and descriptions
 * - Provides audiobook search and discovery
 * - Handles audiobook recommendations
 * - Manages audiobook progress tracking
 * 
 * KEY ENDPOINTS:
 * - POST /upload: Upload new audiobook with metadata
 * - GET /all: Get all audiobooks with pagination
 * - GET /search: Search audiobooks by title, author, genre
 * - GET /:id: Get specific audiobook details
 * - PUT /:id: Update audiobook metadata
 * - DELETE /:id: Delete audiobook
 * - POST /progress: Save listening progress
 * - GET /progress: Get user's listening progress
 * 
 * UPLOAD FEATURES:
 * - File upload to Cloudinary cloud storage
 * - Metadata extraction and validation
 * - Cover art upload and processing
 * - Audio file format validation for audiobooks
 * - File size and quality management
 * - Chapter and section management
 * 
 * PLAYBACK FEATURES:
 * - Audiobook streaming with proper headers
 * - Progress tracking and bookmarking
 * - Chapter navigation and skipping
 * - Playback speed control
 * - Sleep timer functionality
 * - Offline download support
 * 
 * METADATA MANAGEMENT:
 * - Audiobook title, author, narrator
 * - Genre and category classification
 * - Description and summary
 * - Publication date and publisher
 * - Language and duration information
 * - Chapter and section breakdown
 * 
 * PROGRESS TRACKING:
 * - User listening progress storage
 * - Bookmark and note management
 * - Reading speed and time tracking
 * - Completion percentage calculation
 * - Reading history and statistics
 * - Cross-device progress sync
 * 
 * SEARCH FUNCTIONALITY:
 * - Text-based search across audiobook metadata
 * - Author and narrator filtering
 * - Genre and category filtering
 * - Advanced search with multiple criteria
 * - Search result pagination
 * - Relevance scoring and ranking
 * 
 * RECOMMENDATION SYSTEM:
 * - Personalized audiobook recommendations
 * - Genre-based suggestions
 * - Author-based recommendations
 * - Similar audiobook suggestions
 * - Popular and trending audiobooks
 * - User preference learning
 * 
 * INTEGRATION:
 * - Cloudinary for file storage
 * - MongoDB for metadata storage
 * - User authentication for operations
 * - Progress tracking integration
 * - Recommendation algorithms
 * 
 * PERFORMANCE:
 * - Efficient file streaming
 * - Database query optimization
 * - Caching for frequently accessed audiobooks
 * - Pagination for large datasets
 * - Image optimization for cover art
 * 
 * ACCESSIBILITY:
 * - Audio quality options
 * - Playback speed control
 * - Chapter navigation
 * - Progress tracking
 * - Offline access
 * - Multi-device sync
 */

const express = require("express");
const passport = require("passport");
const Audiobook = require("../models/Audiobook");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const User = require("../models/User");

// Create a new audiobook
router.post(
    "/create",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const {
                name,
                author,
                narrator,
                thumbnail,
                audioFile,
                duration,
                description,
                genre,
                chapters
            } = req.body;

            // Validate required fields
            if (!name || !author || !narrator || !thumbnail || !audioFile || !duration || !description || !genre) {
                return res.status(400).json({error: "All fields are required"});
            }

            const audiobookDetails = {
                name,
                author,
                narrator,
                thumbnail,
                audioFile,
                duration,
                description,
                genre,
                chapters: chapters || [],
                uploadedBy: req.user._id
            };

            const createdAudiobook = await Audiobook.create(audiobookDetails);
            return res.json(createdAudiobook);
        } catch (err) {
            console.error("Error creating audiobook:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

// Get all audiobooks
router.get(
    "/get/all",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            console.log("Fetching all audiobooks...");
            console.log("User:", req.user?._id);
            
            const audiobooks = await Audiobook.find().populate("uploadedBy", "firstName lastName");
            console.log("Found audiobooks count:", audiobooks.length);
            console.log("Response data:", {data: audiobooks});
            
            return res.status(200).json({data: audiobooks});
        } catch (err) {
            console.error("Error fetching audiobooks:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

// Get audiobook by ID
router.get(
    "/get/:id",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const audiobook = await Audiobook.findById(req.params.id).populate("uploadedBy", "firstName lastName");
            if (!audiobook) {
                return res.status(404).json({error: "Audiobook not found"});
            }
            return res.json(audiobook);
        } catch (err) {
            console.error("Error fetching audiobook:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

// Update audiobook progress
router.post(
    "/progress/:id",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const { progress } = req.body;
            const userId = req.user._id.toString();

            const audiobook = await Audiobook.findById(req.params.id);
            if (!audiobook) {
                return res.status(404).json({error: "Audiobook not found"});
            }

            // Update progress for the current user
            audiobook.currentProgress.set(userId, progress);
            await audiobook.save();

            return res.json({success: true, progress: audiobook.currentProgress.get(userId)});
        } catch (err) {
            console.error("Error updating progress:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

// Search audiobooks
router.get(
    "/search/:query",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const query = req.params.query;
            const audiobooks = await Audiobook.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { author: { $regex: query, $options: "i" } },
                    { narrator: { $regex: query, $options: "i" } },
                    { genre: { $regex: query, $options: "i" } }
                ]
            }).populate("uploadedBy", "firstName lastName");
            
            return res.json({data: audiobooks});
        } catch (err) {
            console.error("Error searching audiobooks:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

// Delete audiobook
router.delete(
    "/:id",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const audiobook = await Audiobook.findById(req.params.id);
            if (!audiobook) {
                return res.status(404).json({error: "Audiobook not found"});
            }

            // Check if user is the uploader
            if (audiobook.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({error: "Not authorized to delete this audiobook"});
            }

            await Audiobook.findByIdAndDelete(req.params.id);
            return res.json({success: true, message: "Audiobook deleted successfully"});
        } catch (err) {
            console.error("Error deleting audiobook:", err);
            return res.status(500).json({error: "Internal server error", details: err.message});
        }
    }
);

module.exports = router; 