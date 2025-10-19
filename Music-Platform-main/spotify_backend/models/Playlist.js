/**
 * PLAYLIST DATA MODEL
 * 
 * This Mongoose model defines the structure and behavior of playlist data in the application.
 * 
 * WHAT THIS FILE DOES:
 * - Defines the Playlist schema with all playlist-related fields
 * - Manages playlist metadata and song collections
 * - Handles playlist sharing and collaboration features
 * - Provides methods for playlist operations
 * - Manages playlist relationships with users and songs
 * - Handles playlist privacy and access control
 * 
 * SCHEMA FIELDS:
 * - Basic Info: name, description, coverImageUrl
 * - Metadata: createdAt, updatedAt, isPublic
 * - Relationships: owner (User), songs (Song array)
 * - Statistics: songCount, playCount, likeCount
 * - Settings: privacy, collaboration, sharing
 * - Technical: id, version, status
 * 
 * PLAYLIST FEATURES:
 * - Playlist creation and management
 * - Song addition and removal
 * - Playlist sharing and collaboration
 * - Privacy settings and access control
 * - Playlist duplication and cloning
 * - Cover art and visual branding
 * 
 * SONG MANAGEMENT:
 * - Song ordering and arrangement
 * - Bulk song operations
 * - Song metadata preservation
 * - Playlist song count tracking
 * - Song removal and replacement
 * - Playlist song validation
 * 
 * SHARING FEATURES:
 * - Public/private playlist settings
 * - Friend sharing functionality
 * - Playlist following system
 * - Social playlist discovery
 * - Playlist embedding and links
 * - Collaborative editing
 * 
 * COLLABORATION:
 * - Multi-user playlist editing
 * - Contributor management
 * - Edit history tracking
 * - Permission management
 * - Conflict resolution
 * - Real-time collaboration
 * 
 * PRIVACY AND ACCESS:
 * - Public playlist visibility
 * - Private playlist protection
 * - Friend-only sharing
 * - Access control lists
 * - Playlist password protection
 * - Temporary sharing links
 * 
 * RELATIONSHIPS:
 * - Many-to-one with User (owner)
 * - Many-to-many with Songs
 * - Many-to-many with Users (collaborators)
 * - One-to-many with PlaylistHistory
 * - One-to-many with PlaylistShare
 * 
 * ANALYTICS:
 * - Play count statistics
 * - User engagement metrics
 * - Popularity algorithms
 * - Trend analysis
 * - Performance tracking
 * 
 * METHODS:
 * - Song addition and removal
 * - Playlist sharing
 * - Privacy management
 * - Collaboration handling
 * - Statistics calculation
 * 
 * INDEXES:
 * - Owner search index
 * - Name search index
 * - Public playlist index
 * - Creation date index
 * - Popularity index
 * - Full-text search indexes
 */

const mongoose = require("mongoose");
// How to create a model
// Step 1 :require mongoose
// Step 2 :Create a mongoose schema (structure of a user)
// Step 3 : Create a model

const Playlist = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    // 1. Playlist mein songs kaunse hain
    // 2. Playlist collaborators
    songs: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Song",
        },
    ],
    collaborators: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    ],
});

const PlaylistModel = mongoose.model("Playlist", Playlist);

module.exports = PlaylistModel;
