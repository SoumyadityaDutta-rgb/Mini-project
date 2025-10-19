/**
 * BACKEND SERVER ENTRY POINT
 * 
 * This is the main server file for the Music Platform backend API.
 * 
 * WHAT THIS FILE DOES:
 * - Sets up Express.js server with middleware configuration
 * - Manages MongoDB database connections
 * - Configures JWT authentication with Passport.js
 * - Sets up WebSocket server for real-time features
 * - Defines API routes for all application features
 * - Handles authentication and authorization
 * - Manages error handling and logging
 * 
 * KEY FEATURES:
 * - RESTful API endpoints for all application features
 * - WebSocket server for real-time communication
 * - MongoDB database integration with Mongoose
 * - JWT-based authentication system with Passport.js
 * - CORS configuration for frontend integration
 * - Comprehensive error handling and logging
 * - Socket authentication middleware
 * 
 * API ROUTES:
 * - Authentication routes (login, signup, logout)
 * - Song management (upload, play, like, search)
 * - Playlist management (create, update, delete)
 * - User management (profile, friends, requests)
 * - Audiobook management (upload, play, search)
 * - Chat and messaging functionality
 * - Friend management and social features
 * 
 * MIDDLEWARE STACK:
 * - CORS for cross-origin requests
 * - JSON body parsing
 * - Passport.js for JWT authentication
 * - Route logging for debugging
 * - Global error handling
 * - Socket authentication
 * 
 * DATABASE INTEGRATION:
 * - MongoDB connection management
 * - Mongoose ODM for data modeling
 * - Connection error handling
 * - Environment-based configuration
 * 
 * SECURITY FEATURES:
 * - JWT token validation with Passport.js
 * - Socket authentication middleware
 * - CORS configuration
 * - Error handling for authentication failures
 * - Token extraction and verification
 * 
 * REAL-TIME FEATURES:
 * - Socket.io server setup with CORS
 * - Socket authentication middleware
 * - Real-time event handling via socketManager
 * - User presence tracking
 * - Live messaging system
 * 
 * AUTHENTICATION FLOW:
 * - JWT token extraction from Authorization header
 * - Token verification with secret key
 * - User lookup in database
 * - Socket authentication for real-time features
 * - Error handling for invalid tokens
 * 
 * DEPLOYMENT:
 * - Environment variable configuration
 * - Port management (default: 8000)
 * - Production/development mode handling
 * - HTTP server setup for Socket.io
 */

const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const cors = require("cors");
const User = require("./models/User");
const socketManager = require("./socketManager");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = 8000;

// Create HTTP server
const server = require("http").createServer(app);

// Initialize Socket.IO
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize passport
app.use(passport.initialize());

// Setup passport-jwt
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

// Add debug logging for JWT verification
passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            console.log("JWT payload:", jwt_payload);
            
            if (!jwt_payload.identifier) {
                console.log("No identifier in JWT payload");
                return done(null, false);
            }
            
            const user = await User.findOne({_id: jwt_payload.identifier});
            
            if (user) {
                console.log("User found:", user._id);
                return done(null, user);
            } else {
                console.log("User not found for identifier:", jwt_payload.identifier);
                return done(null, false);
            }
        } catch (err) {
            console.error("JWT Strategy error:", err);
            return done(err, false);
        }
    })
);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URL)
    .then((x) => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

// Import routes
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const audiobookRoutes = require("./routes/audiobook");
const friendRoutes = require("./routes/friends");
const chatRoutes = require("./routes/chat");

// Register routes
app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);
app.use("/audiobook", audiobookRoutes);
app.use("/friends", friendRoutes);
app.use("/chat", chatRoutes);

// Initialize Socket.IO manager
socketManager(io);

// Socket.IO authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token || !token.startsWith('Bearer ')) {
            return next(new Error('Authentication error: Invalid token format'));
        }

        const tokenString = token.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        if (!decoded.identifier) {
            return next(new Error('Authentication error: Invalid token payload'));
        }

        const user = await User.findById(decoded.identifier);
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        // Attach user to socket
        socket.user = user;
        console.log('Socket authenticated for user:', user._id);
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: ' + error.message));
    }
});

// Add route logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    console.error("Stack trace:", err.stack);
    
    // Handle specific types of errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: "Unauthorized",
            details: "Invalid token or no token provided"
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: "Validation Error",
            details: err.message
        });
    }
    
    // Default error response
    res.status(500).json({
        error: "Something went wrong!",
        details: err.message
    });
});

// Listen on HTTP server instead of app
server.listen(port, () => {
    console.log(`App is running on port ${port}`);
});