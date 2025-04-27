const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User=require("../models/user");


router.post("/create", passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { name, thumbnail, track } = req.body;
    if (!name || !thumbnail || !track) {
        return res.status(301).json({ err: "Insufficient details to create song" });
    }
    const artist = req.user._id;
    const songDetails = { name, thumbnail, track, artist };
    const createdSong = await Song.create(songDetails);
    return res.status(200).json(createdSong);
});

// Existing GET route to fetch user's songs
router.get("/get/mysongs", passport.authenticate("jwt", { session: false }), async (req, res) => {
    const songs = await Song.find({ artist: req.user._id });
    return res.status(200).json({ data: songs });
});
//rpute get to get all songs by an artist
//i will send the artust id and i will see all the songs witht hte id
router.get("/get/artist/:artistId",passport.authenticate("jwt",{session:false}),
    async(req,res)=>{
        const {artistId}=req.params;
        //we can check if the artist does not exist
        const artist=await User.find({_id:artistId});
        if(!artist){
            return res.status(301).json({err:"artist doesnt exist"});
        }
        const songs=await Song.find({artist:artistId});
        return res.status(200).json({data:songs});
    }

);
//get route tp get a sinlg esong by name
router.get("/get/songname/:songName",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const { songName } = req.params; 
        
        const songs = await Song.find({ name: songName });
        return res.status(200).json({ data: songs });
    }
);

module.exports = router;
