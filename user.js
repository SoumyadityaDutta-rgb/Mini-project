const mongoose = require("mongoose");

const User = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    likedSongs: {
        type: String,
        default: "",
    },
    likedplaylists: {
        type: String,
        default: "",
    },
    subscribedartisits: {
        type: String,
        default: "",
    },
});

const Usermodel = mongoose.model("User", User);
module.exports = Usermodel; 
