const mongoose =require("mongoose");
const playlist=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    songs:[
        {
        type:mongoose.Types.ObjectId,
        ref:"song"
    },
],
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        
    },
    collaborators:[
        {
            type:mongoose.Types.ObjectId,
            ref:"User"


    }
    ],

});
module.exports = mongoose.models.Playlist || mongoose.model("Playlist", playlist);
//write above line instaed of the line belwo 2 lines to avoid overwrite error.
//const playlistmodel=mongoose.model("Song",playlist);
//module.export=playlistmodel;
//ther is an errpr here
