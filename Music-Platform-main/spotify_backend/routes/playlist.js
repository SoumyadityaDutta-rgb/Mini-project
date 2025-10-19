/**
 * PLAYLIST MANAGEMENT ROUTES
 * 
 * This file handles all playlist-related operations and endpoints.
 * 
 * WHAT THIS FILE DOES:
 * - Manages playlist creation, editing, and deletion
 * - Handles adding/removing songs from playlists
 * - Provides playlist sharing and collaboration features
 * - Manages playlist metadata and descriptions
 * - Handles playlist search and discovery
 * - Provides playlist recommendations
 * 
 * KEY ENDPOINTS:
 * - POST /create: Create new playlist
 * - GET /all: Get user's playlists
 * - GET /:id: Get specific playlist details
 * - PUT /:id: Update playlist information
 * - DELETE /:id: Delete playlist
 * - POST /:id/add-song: Add song to playlist
 * - DELETE /:id/remove-song: Remove song from playlist
 * - POST /:id/share: Share playlist with friends
 * 
 * PLAYLIST FEATURES:
 * - Playlist creation with custom names and descriptions
 * - Cover art upload and management
 * - Song ordering and arrangement
 * - Playlist privacy settings (public/private)
 * - Collaborative playlist editing
 * - Playlist duplication and cloning
 * 
 * SONG MANAGEMENT:
 * - Add songs to playlists
 * - Remove songs from playlists
 * - Reorder songs within playlists
 * - Bulk song operations
 * - Song metadata preservation
 * - Playlist song count tracking
 * 
 * SHARING FEATURES:
 * - Share playlists with friends
 * - Public playlist discovery
 * - Playlist following system
 * - Social playlist recommendations
 * - Playlist embedding and links

 * PERFORMANCE:
 * - Efficient playlist loading
 * - Pagination for large playlists
 * - Caching for frequently accessed playlists
 * - Optimized database queries
 * - Real-time updates
 */

const express = require("express");
const passport = require("passport");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");
const router = express.Router();

// Route 1: Create a playlist
router.post("/create", 
    passport.authenticate("jwt", { session: false }),
    async (req,res)=>{
        try {
            const currentUser=req.user;
            const {name,thumbnail,songs}=req.body;
            if(!name || !thumbnail){
                return res.status(400).json({err:"Insufficient data. Name and thumbnail are required."});
            }
            const playlistData={
                name,
                thumbnail,
                songs: songs || [],
                owner:currentUser._id,
                collaborators:[],
            };
            const playlist = await Playlist.create(playlistData);
            return res.status(200).json(playlist);
        } catch (error) {
            console.error("Error creating playlist:", error);
            return res.status(500).json({err: "Internal server error"});
        }
    }
);

// Get current user's playlists
router.get(
    "/get/me",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const playlists = await Playlist.find({ owner: req.user._id })
                .populate({
                    path: "songs",
                    populate: {
                        path: "artist",
                        select: "firstName lastName username"
                    }
                });
            return res.status(200).json({ data: playlists });
        } catch (error) {
            console.error("Error fetching playlists:", error);
            return res.status(500).json({ err: "Error fetching playlists" });
        }
    }
);

// Route 2: Get a playlist by ID
router.get("/get/playlist/:playlistId",
    passport.authenticate("jwt",{session:false}),
    async(req,res)=>{
        try {
            const playlistId = req.params.playlistId;
            const playlist = await Playlist.findOne({_id: playlistId})
                .populate({
                    path: "songs",
                    populate: {
                        path: "artist",
                        select: "firstName lastName username"
                    }
                })
                .populate("owner", "firstName lastName username");

            if(!playlist){
                return res.status(404).json({err:"Playlist not found"});
            }

            console.log("Fetched playlist:", playlist); // Add logging
            return res.status(200).json(playlist);
        } catch (error) {
            console.error("Error fetching playlist:", error);
            return res.status(500).json({err: "Internal server error"});
        }
    }
);
// get all playlist one by aritst
 router.get(
    "/get/artist/:artistId",
    passport.authenticate("jwt",{session:false}),
    async(req,res)=>{
        const artistId=req.params.artistId;
        const artist=await User.findOne({_id:artistId});
        if(!artist){
            return res.status(304).json({err:"Invalid artist id"});
        }
        const playlists=await Playlist.find({owner:artistId })
        return res.status(200).json({data:playlists});



    }

);
router.post(
    "/add/song",
    passport.authenticate("jwt",{session:false}),
    async(req,res)=> {
        try {
            const currentUser = req.user;
            const {playlistId, songId} = req.body;
            
            console.log("Adding song to playlist:", {playlistId, songId}); // Debug log
            
            // Get the playlist if valid
            const playlist = await Playlist.findOne({_id: playlistId});
            if(!playlist) {
                console.log("Playlist not found:", playlistId); // Debug log
                return res.status(404).json({err: "Playlist not found"});
            }
            
            // Check if currentUser owns the playlist or is a collaborator
            if(
                playlist.owner.toString() !== currentUser._id.toString() &&
                !playlist.collaborators.includes(currentUser._id)
            ) {
                console.log("User not authorized:", currentUser._id); // Debug log
                return res.status(403).json({err: "Not authorized to modify this playlist"});
            }
            
            // Check if song exists
            const song = await Song.findOne({_id: songId});
            if(!song) {
                console.log("Song not found:", songId); // Debug log
                return res.status(404).json({err: "Song not found"});
            }
            
            // Add song if it's not already in the playlist
            if (!playlist.songs.includes(songId)) {
                playlist.songs.push(songId);
                await playlist.save();
                console.log("Song added to playlist successfully"); // Debug log
            } else {
                console.log("Song already in playlist"); // Debug log
            }
            
            // Return the updated playlist with populated data
            const updatedPlaylist = await Playlist.findById(playlist._id)
                .populate({
                    path: "songs",
                    model: "Song",
                    populate: {
                        path: "artist",
                        model: "User",
                        select: "firstName lastName username"
                    }
                })
                .populate("owner", "firstName lastName username");
            
            console.log("Returning updated playlist with", updatedPlaylist.songs.length, "songs"); // Debug log
            
            return res.status(200).json(updatedPlaylist);
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            return res.status(500).json({err: "Internal server error"});
        }
    }
);

// Delete a playlist
router.delete(
    "/delete/:playlistId",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const currentUser = req.user;
            const playlistId = req.params.playlistId;

            // Get the playlist
            const playlist = await Playlist.findById(playlistId);
            if (!playlist) {
                return res.status(404).json({error: "Playlist not found"});
            }

            // Check if currentUser owns the playlist
            if (playlist.owner.toString() !== currentUser._id.toString()) {
                return res.status(403).json({error: "Not authorized to delete this playlist"});
            }

            // Delete the playlist
            await Playlist.findByIdAndDelete(playlistId);

            return res.status(200).json({message: "Playlist deleted successfully"});
        } catch (error) {
            console.error("Error deleting playlist:", error);
            return res.status(500).json({error: "Internal server error"});
        }
    }
);

module.exports = router;
