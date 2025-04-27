const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { getToken } = require("../utlis/helpers");

// POST route for user registration
router.post("/register", async (req, res) => {
    const { email, password, firstname, lastname, username } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email: email });
    if (user) {
        return res
            .status(403)
            .json({ error: "A user with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUserData = {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        username
    };

    // Save new user to DB
    const newUser = await User.create(newUserData);

    // Generate token
    const token = await getToken(email, newUser);

    // Send user back without password
    const userToReturn = { ...newUser.toJSON(), token };
    delete userToReturn.password;

    return res.status(200).json(userToReturn);
});
router.post("/login",async(req,res)=>{
     
        // Step 1: Get email and password sent by user from req.body
        const { email, password } = req.body;
        
        // Step 2: Chekc if a user with the given email exists. If not, the credetials are inalid.
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(403).json({ err: "Invalid credentials" });
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(403).json({err:"Invalid credentials"});

        }
        const token=await getToken(user.email,user);
        const userToReturn = { ...User.toJSON(), token };
        delete userToReturn.password;

        return res.status(200).json(userToReturn);
        

});

module.exports = router;
