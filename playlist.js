 const express = require("express");
const passport = require("passport");
const Playlist=require("../models/Playlist");
const User=require("../models/user");
const Song=require("../models/Song");       
const router = express.Router();

// Route 1: Create a playlist
router.post("/create", 
    passport.authenticate("jwt", { session: false }),
    async (req,res)=>{
        const currentUser=req.user;
        const {name,thumbnail,songs}=req.body;
        if(!name || !thumbnail || !songs){
            return res.status(301).json({err:"Insuffienit data"});
        }
        const playlistData={
            name,
            thumbnail,
            songs,
            owner:currentUser._id,
            collaborators:[],
        };
        const playlist=await Playlist.create(playlistData);
        return res.status(200).json(playlist);
    }

);

// Route 2: Get a playlist by ID
router.get("/get/playlist/:playlistId",
    passport.authenticate("jwt",{session:false}),
    async(req,res)=>{
        //this concep is called as req.parmas
        const playlistId=req.params.playlistId;
        //i need to find the playliostwith _id=playlistid
        const playlist=await Playlist.findOne({_id:playlistId});
        if(!playlist){
            return res.status(301).json({err:"Invalid Id"});
        }
        return res.status(200).json(playlist);
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
        const currentUser=req.user;
        const {playlistId,songId}=req.body;
        //get the playlist id if valid
        const playlist=await Playlist.findOne({_id:playlistId});
        if(!playlist){
            return res.status(304).json({err:"playlist does not exist"});

        }
        //step1:check if currentuser own the playsdidt or is a collaborator
        if(
            playlist.owner!=currentUser._id &&
            !playlist.collaborators.includes(currentUser._id) 
        ) {
            return res.status(400).json({err:"not aloowed"});

        }
        //check if song is valid song
        const song=await Song.findOne({_id:songId});
        if(!song){
            return res.status(304).jaon({err:"song doesnt exist"});
        }
        playlist.songs.push(songId);
        await playlist.save();
        return res.status(200).json(playlist); 
            
    }
)
module.exports = router;

