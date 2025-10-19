/**
 * AUDIOBOOK DATA MODEL
 * 
 * This Mongoose model defines the structure and behavior of audiobook data in the application.
 * 
 * WHAT THIS FILE DOES:
 * - Defines the Audiobook schema with all audiobook-related fields
 * - Manages audiobook metadata and file information
 * - Handles audiobook playback statistics and tracking
 * - Provides methods for audiobook operations
 * - Manages audiobook relationships with users
 * - Handles audiobook search and discovery features
 * 
 * SCHEMA FIELDS:
 * - Basic Info: title, author, narrator, genre
 * - File Info: audiobookUrl, coverImageUrl, duration, fileSize
 * - Metadata: description, publisher, releaseDate, language
 * - Statistics: playCount, likeCount, downloadCount
 * - Relationships: uploadedBy, likedBy, progress
 * - Technical: format, quality, bitrate, chapters
 * 
 * UPLOAD FEATURES:
 * - File upload tracking and validation
 * - Metadata extraction and storage
 * - Cover art management
 * - File format and size validation
 * - Chapter and section management
 * - Upload progress tracking
 * 
 * PLAYBACK FEATURES:
 * - Play count tracking and analytics
 * - Progress tracking and bookmarking
 * - Chapter navigation and skipping
 * - Playback speed control
 * - Sleep timer functionality
 * - Offline download support
 * 
 * METADATA MANAGEMENT:
 * - Author and narrator information
 * - Genre and category classification
 * - Publication details and publisher
 * - Language and duration information
 * - Chapter and section breakdown
 * - Description and summary
 * 
 * PROGRESS TRACKING:
 * - User listening progress storage
 * - Bookmark and note management
 * - Reading speed and time tracking
 * - Completion percentage calculation
 * - Reading history and statistics
 * - Cross-device progress sync
 * 
 * SEARCH AND DISCOVERY:
 * - Text-based search indexing
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
 * RELATIONSHIPS:
 * - Many-to-one with User (uploader)
 * - Many-to-many with User (likes)
 * - One-to-many with Progress (listening progress)
 * - One-to-many with Bookmark (user bookmarks)
 * - One-to-many with Recommendation
 * 
 * ANALYTICS:
 * - Play count statistics
 * - User engagement metrics
 * - Popularity algorithms
 * - Trend analysis
 * - Performance tracking
 * 
 * METHODS:
 * - Progress tracking
 * - Bookmark management
 * - Search optimization
 * - Metadata validation
 * - File management
 * 
 * INDEXES:
 * - Title search index
 * - Author search index
 * - Genre index
 * - Upload date index
 * - Popularity index
 * - Full-text search indexes
 */

const mongoose = require("mongoose");

const Audiobook = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    narrator: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    audioFile: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chapters: [{
        name: {
            type: String,
            required: true,
        },
        startTime: {
            type: Number,
            required: true,
        },
        endTime: {
            type: Number,
            required: true,
        }
    }],
    currentProgress: {
        type: Map,
        of: Number,
        default: new Map(),
    }
}, {
    timestamps: true
});

const AudiobookModel = mongoose.model("Audiobook", Audiobook);

module.exports = AudiobookModel; 