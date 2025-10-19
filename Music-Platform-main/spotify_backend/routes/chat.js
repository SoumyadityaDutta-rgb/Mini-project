const express = require("express");
const router = express.Router();
const passport = require("passport");
const ChatMessage = require("../models/ChatMessage");

// Get chat history with a friend
router.get(
    "/history/:friendId",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const messages = await ChatMessage.find({
                $or: [
                    { sender: req.user._id, receiver: req.params.friendId },
                    { sender: req.params.friendId, receiver: req.user._id }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("sender", "username firstName lastName profilePicture")
            .populate("receiver", "username firstName lastName profilePicture");

            return res.json({ data: messages.reverse() });
        } catch (err) {
            console.error("Error fetching chat history:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Mark messages as read
router.put(
    "/read/:friendId",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            await ChatMessage.updateMany(
                {
                    sender: req.params.friendId,
                    receiver: req.user._id,
                    read: false
                },
                { read: true }
            );
            return res.json({ success: true });
        } catch (err) {
            console.error("Error marking messages as read:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Get unread message count
router.get(
    "/unread",
    passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        try {
            const unreadCounts = await ChatMessage.aggregate([
                {
                    $match: {
                        receiver: req.user._id,
                        read: false
                    }
                },
                {
                    $group: {
                        _id: "$sender",
                        count: { $sum: 1 }
                    }
                }
            ]);

            return res.json({ data: unreadCounts });
        } catch (err) {
            console.error("Error fetching unread counts:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router; 