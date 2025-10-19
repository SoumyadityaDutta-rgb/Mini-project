const mongoose = require("mongoose");

const ChatMessage = new mongoose.Schema({
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
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying of chat history
ChatMessage.index({ sender: 1, receiver: 1, createdAt: -1 });

const ChatMessageModel = mongoose.model("ChatMessage", ChatMessage);
module.exports = ChatMessageModel; 