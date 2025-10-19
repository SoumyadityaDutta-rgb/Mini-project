const mongoose = require("mongoose");

const FriendRequest = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness of friend requests
FriendRequest.index({ sender: 1, receiver: 1 }, { unique: true });

const FriendRequestModel = mongoose.model("FriendRequest", FriendRequest);
module.exports = FriendRequestModel; 