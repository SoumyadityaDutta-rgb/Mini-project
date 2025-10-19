/**
 * SOCKET.IO MANAGER
 * 
 * This file manages all real-time WebSocket connections and events for the application.
 * 
 * WHAT THIS FILE DOES:
 * - Manages WebSocket server connections and events
 * - Handles real-time chat messaging between users
 * - Manages user online/offline status tracking
 * - Handles friend request notifications
 * - Manages real-time music sharing and recommendations
 * - Provides live activity updates and notifications
 * 
 * KEY FEATURES:
 * - WebSocket connection management
 * - Real-time messaging system
 * - User presence tracking
 * - Friend request notifications
 * - Live music sharing
 * - Activity feed updates
 * 
 

 * 
 * INTEGRATION:
 * - Database integration for message persistence
 * - User authentication system integration
 * - Friend system integration
 * - Notification system integration
 * - Frontend real-time updates
 */

const ChatMessage = require("./models/ChatMessage");
const User = require("./models/User");

const connectedUsers = new Map();

const socketManager = (io) => {
    io.on("connection", async (socket) => {
        const userId = socket.user._id;

        // Store socket connection
        connectedUsers.set(userId.toString(), socket.id);

        // Update user's online status
        await User.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
        });

        // Notify friends that user is online
        const user = await User.findById(userId);
        if (user && user.friends.length > 0) {
            user.friends.forEach(friendId => {
                const friendSocketId = connectedUsers.get(friendId.toString());
                if (friendSocketId) {
                    io.to(friendSocketId).emit("friendOnline", { userId });
                }
            });
        }

        // Handle private messages
        socket.on("privateMessage", async (data) => {
            try {
                const { receiverId, content } = data;
                
                // Save message to database
                const message = await ChatMessage.create({
                    sender: userId,
                    receiver: receiverId,
                    content
                });

                // Populate sender details
                await message.populate("sender", "username firstName lastName profilePicture");

                // Send to receiver if online
                const receiverSocketId = connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", message);
                }

                // Send confirmation to sender
                socket.emit("messageSent", message);
            } catch (error) {
                console.error("Error sending private message:", error);
                socket.emit("messageError", { error: "Failed to send message" });
            }
        });

        // Handle typing status
        socket.on("typing", (data) => {
            const { receiverId } = data;
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { userId });
            }
        });

        // Handle currently playing song updates
        socket.on("updateCurrentlyPlaying", async (data) => {
            try {
                const { songId } = data;
                await User.findByIdAndUpdate(userId, {
                    currentlyPlaying: {
                        song: songId,
                        timestamp: new Date()
                    }
                });

                // Notify friends
                const user = await User.findById(userId);
                if (user && user.friends.length > 0) {
                    user.friends.forEach(friendId => {
                        const friendSocketId = connectedUsers.get(friendId.toString());
                        if (friendSocketId) {
                            io.to(friendSocketId).emit("friendCurrentlyPlaying", {
                                userId,
                                songId,
                                timestamp: new Date()
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error updating currently playing:", error);
            }
        });

        // Handle disconnection
        socket.on("disconnect", async () => {
            connectedUsers.delete(userId.toString());
            
            // Update user's online status and last seen
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Notify friends that user is offline
            const user = await User.findById(userId);
            if (user && user.friends.length > 0) {
                user.friends.forEach(friendId => {
                    const friendSocketId = connectedUsers.get(friendId.toString());
                    if (friendSocketId) {
                        io.to(friendSocketId).emit("friendOffline", {
                            userId,
                            lastSeen: new Date()
                        });
                    }
                });
            }
        });
    });
};

module.exports = socketManager; 