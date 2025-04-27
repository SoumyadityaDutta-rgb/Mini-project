const mongoose = require("mongoose");

const song = new mongoose.Schema({
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
    }
});

const Songmodel = mongoose.model("Song", song);
module.exports = Songmodel; // ✅ Corrected here
