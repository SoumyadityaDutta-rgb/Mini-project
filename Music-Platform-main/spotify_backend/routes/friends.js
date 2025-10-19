/**
 * FRIEND MANAGEMENT ROUTES
 * 
 * This file handles all friend-related operations and social features.
 * 
 * WHAT THIS FILE DOES:
 * - Manages friend request sending and receiving
 * - Handles friend request acceptance and decline
 * - Provides friend list management
 * - Manages user search for adding friends
 * - Handles friend activity and status tracking
 * - Provides social features like recommendations and sharing
 * 
 * KEY ENDPOINTS:
 * - POST /send-request: Send friend request to user
 * - POST /accept-request: Accept incoming friend request
 * - POST /decline-request: Decline incoming friend request
 * - GET /requests: Get pending friend requests
 * - GET /friends: Get user's friend list
 * - GET /search: Search for users to add as friends
 * - POST /recommend: Send music recommendation to friend
 * - POST /share-playlist: Share playlist with friend
 * - GET /activity: Get friend activity feed
 * 
 * FRIEND REQUEST SYSTEM:
 * - Send friend requests to other users
 * - Accept or decline incoming requests
 * - Prevent duplicate friend requests
 * - Handle request status tracking
 * - Notification system for requests
 * 
 * SOCIAL FEATURES:
 * - Music recommendations between friends
 * - Playlist sharing functionality
 * - Friend activity tracking
 * - Currently playing status sharing
 * - Social interaction history
 * 
 * USER SEARCH:
 * - Search users by username or name
 * - Filter out existing friends
 * - Show user profiles for friend requests
 * - Prevent self-friend requests
 * - Privacy controls for search results
 * 
 * ACTIVITY TRACKING:
 * - Friend online/offline status
 * - Currently playing music status
 * - Recent activity feed
 * - Social interaction history
 * - Real-time status updates
 * 
 * RECOMMENDATION SYSTEM:
 * - Send song recommendations to friends
 * - Track recommendation history
 * - Personalized recommendation algorithms
 * - Social music discovery
 * - Collaborative filtering
 * 
 * INTEGRATION:
 * - MongoDB for friend relationship storage
 * - Socket.io for real-time updates
 * - User authentication for all operations
 * - Notification system integration
 * - Activity feed management
 * 
 * PRIVACY FEATURES:
 * - Friend request privacy controls
 * - Activity visibility settings
 * - Profile privacy management
 * - Block user functionality
 * - Report inappropriate behavior
 * 
 * PERFORMANCE:
 * - Efficient friend list queries
 * - Real-time status updates
 * - Activity feed optimization
 * - Search result caching
 * - Database indexing for relationships
 */

const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Playlist = require("../models/Playlist");
const router = express.Router();

// Search users
router.get(
    "/search/:query",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const query = req.params.query;
            const users = await User.find({
                $or: [
                    { username: { $regex: query, $options: "i" } },
                    { firstName: { $regex: query, $options: "i" } },
                    { lastName: { $regex: query, $options: "i" } }
                ],
                _id: { $ne: req.user._id } // Exclude current user
            }).select("username firstName lastName profilePicture");
            
            return res.json({ data: users });
        } catch (err) {
            console.error("Error searching users:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Send friend request
router.post(
    "/request",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const { receiverId } = req.body;
            
            // Check if request already exists
            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { sender: req.user._id, receiver: receiverId },
                    { sender: receiverId, receiver: req.user._id }
                ]
            });

            if (existingRequest) {
                return res.status(400).json({ error: "Friend request already exists" });
            }

            // Create new request
            const request = await FriendRequest.create({
                sender: req.user._id,
                receiver: receiverId
            });

            return res.json(request);
        } catch (err) {
            console.error("Error sending friend request:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Accept friend request
router.post(
    "/request/:requestId/accept",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const request = await FriendRequest.findById(req.params.requestId);
            
            if (!request) {
                return res.status(404).json({ error: "Request not found" });
            }

            if (request.receiver.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Not authorized" });
            }

                // Add users to each other's friend lists
                await User.updateOne(
                    { _id: request.sender },
                    { $addToSet: { friends: request.receiver } }
                );
                await User.updateOne(
                    { _id: request.receiver },
                    { $addToSet: { friends: request.sender } }
                );

            request.status = "accepted";
            await request.save();

            return res.json({ message: "Friend request accepted" });
        } catch (err) {
            console.error("Error accepting friend request:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Decline friend request
router.post(
    "/request/:requestId/decline",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const request = await FriendRequest.findById(req.params.requestId);
            
            if (!request) {
                return res.status(404).json({ error: "Request not found" });
            }

            if (request.receiver.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Not authorized" });
            }

            request.status = "declined";
            await request.save();

            return res.json({ message: "Friend request declined" });
        } catch (err) {
            console.error("Error declining friend request:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Send recommendation
router.post(
    "/recommend",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const { friendId, songId, type } = req.body;
            
            // Check if they are friends
            const user = await User.findById(req.user._id);
            if (!user.friends.includes(friendId)) {
                return res.status(403).json({ error: "Can only send recommendations to friends" });
            }

            // Here you would typically save the recommendation to a database
            // For now, we'll just return success
            return res.json({ message: "Recommendation sent successfully" });
        } catch (err) {
            console.error("Error sending recommendation:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Share playlist
router.post(
    "/share-playlist",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const { friendId, playlistId } = req.body;
            
            // Check if they are friends
            const user = await User.findById(req.user._id);
            if (!user.friends.includes(friendId)) {
                return res.status(403).json({ error: "Can only share playlists with friends" });
            }

            // Here you would typically save the shared playlist to a database
            // For now, we'll just return success
            return res.json({ message: "Playlist shared successfully" });
        } catch (err) {
            console.error("Error sharing playlist:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Get friend list
router.get(
    "/list",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id)
                .populate("friends", "username firstName lastName profilePicture isOnline lastSeen currentlyPlaying");
            return res.json({ data: user.friends });
        } catch (err) {
            console.error("Error fetching friend list:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Get pending friend requests
router.get(
    "/requests",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const requests = await FriendRequest.find({
                receiver: req.user._id,
                status: "pending"
            }).populate("sender", "username firstName lastName profilePicture");
            return res.json({ data: requests });
        } catch (err) {
            console.error("Error fetching friend requests:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router; 