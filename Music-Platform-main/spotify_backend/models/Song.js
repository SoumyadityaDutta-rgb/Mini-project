/**
 * SONG DATA MODEL
 * 
 * This Mongoose model defines the structure and behavior of song data in the application.
 * 
 * WHAT THIS FILE DOES:
 * - Defines the Song schema with all song-related fields
 * - Manages song metadata and file information
 * - Handles song playback statistics and tracking
 * - Provides methods for song operations
 * - Manages song relationships with users and playlists
 * - Handles song search and discovery features
 * 
 * SCHEMA FIELDS:
 * - Basic Info: title, artist, genre, releaseDate
 
 * 
 
 */

const mongoose = require("mongoose");
// How to create a model
// Step 1 :require mongoose
// Step 2 :Create a mongoose schema (structure of a user)
// Step 3 : Create a model

const Song = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    track: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    author: {
        type: String,
        required: true,
    },
});

const SongModel = mongoose.model("Song", Song);

module.exports = SongModel;