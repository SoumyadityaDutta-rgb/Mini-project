const jwt = require("jsonwebtoken");
require("dotenv").config();

exports = {};

exports.getToken = async (email, user) => {
    try {
        if (!user || !user._id) {
            console.error("Invalid user data for token generation:", { email, userId: user?._id });
            throw new Error("Invalid user data for token generation");
        }

        console.log("Generating token for user:", user._id);
        
        const token = jwt.sign(
            { identifier: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        return token;
    } catch (error) {
        console.error("Token generation error:", error);
        throw error;
    }
};

module.exports = exports;