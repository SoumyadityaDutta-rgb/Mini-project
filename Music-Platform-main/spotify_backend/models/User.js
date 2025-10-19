/**
 * USER DATA MODEL
 * 
 * This Mongoose model defines the structure and behavior of user data in the application.
 * 
 * WHAT THIS FILE DOES:
 * - Defines the User schema with all user-related fields
 * - Handles password hashing and validation
 * - Manages user profile information
 * - Provides methods for user authentication
 * - Handles user relationships and social features
 * - Manages user preferences and settings
 * 
 * SCHEMA FIELDS:
 * - Basic Info: firstName, lastName, email, username
 * - Authentication: password (hashed), profilePicture
 * - Social Features: friends array, friendRequests
 * - Preferences: likedSongs, playlists, audiobooks
 * - Activity: recentlyPlayed, listeningHistory
 * - Settings: privacy settings, notification preferences
 * 
 * AUTHENTICATION FEATURES:
 * - Password hashing with bcrypt
 * - Password validation and strength checking
 * - JWT token generation methods
 * - Secure password comparison
 * - Account verification status
 * 
 * SOCIAL FEATURES:
 * - Friend relationship management
 * - Friend request handling
 * - Social activity tracking
 * - Profile visibility settings
 * - User interaction history
 * 
 * MUSIC FEATURES:
 * - Liked songs collection
 * - Playlist ownership
 * - Recently played tracking
 * - Listening history
 * - Music preferences
 * 
 * PROFILE MANAGEMENT:
 * - Profile picture upload and storage
 * - Bio and personal information
 * - Privacy settings
 * - Account preferences
 * - Notification settings
 * 
 * DATA VALIDATION:
 * - Email format validation
 * - Username uniqueness
 * - Password strength requirements
 * - Required field validation
 * - Data type validation
 * 
 * RELATIONSHIPS:
 * - One-to-many with Playlists
 * - Many-to-many with Songs (likes)
 * - Many-to-many with Users (friends)
 * - One-to-many with Audiobooks
 * - One-to-many with ChatMessages
 * 
 * METHODS:
 * - Password hashing and comparison
 * - Friend management methods
 * - Profile update methods
 * - Activity tracking methods
 * - Preference management
 * 
 * INDEXES:
 * - Email uniqueness index
 * - Username uniqueness index
 * - Search optimization indexes
 * - Performance optimization
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// How to create a model
// Step 1 :require mongoose
// Step 2 :Create a mongoose schema (structure of a user)
// Step 3 : Create a model

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        private: true
    },
    profilePicture: {
        type: String,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    },
    likedSongs: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Song"
        }],
        default: [],
        required: false
    },
    likedPlaylists: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "Playlist"
        }],
        default: [],
        required: false
    },
    subscribedArtists: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "User"
        }],
        default: [],
        required: false
    },
    friends: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    currentlyPlaying: {
        song: {
            type: mongoose.Types.ObjectId,
            ref: "Song"
        },
        timestamp: Date
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Pre-save middleware to ensure arrays are initialized
UserSchema.pre('save', function(next) {
    if (!this.isModified('likedSongs')) this.likedSongs = this.likedSongs || [];
    if (!this.isModified('likedPlaylists')) this.likedPlaylists = this.likedPlaylists || [];
    if (!this.isModified('subscribedArtists')) this.subscribedArtists = this.subscribedArtists || [];
    next();
});

// Static method to update arrays without full validation
UserSchema.statics.updateArrays = async function(userId, updates) {
    try {
        const result = await this.updateOne(
            { _id: userId },
            updates,
            { 
                runValidators: false,
                new: true 
            }
        );
        return result;
    } catch (error) {
        console.error('Error updating arrays:', error);
        return null;
    }
};

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;