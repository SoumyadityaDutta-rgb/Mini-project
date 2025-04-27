const express = require("express");
const mongoose = require("mongoose"); 
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require("passport");
const User = require("./models/user");
const authRoutes = require("./routes/auth");
const songRoutes=require("./routes/song");
const playlistRoutes=require("./routes/playlist");

require("dotenv").config();

const app = express();
const port = 800; 

app.use(express.json());
app.use(passport.initialize());


mongoose.connect("mongodb+srv://soumyadityadutta40:Gargi%40123@cluster0.rxwqhik.mongodb.net/spotify?retryWrites=true&w=majority&appName=Cluster0")

  .then(() => {
      console.log("Connected to MongoDB!");
  })
  .catch((err) => {
      console.log("Error while connecting to MongoDB", err);
  });

app.get("/", (req, res) => {
    res.send("hello world");
});

app.use("/auth", authRoutes);
app.use("/song",songRoutes);
app.use("/playlist",playlistRoutes);

app.listen(port, () => {
    console.log("App is running on port " + port);
});

// Passport JWT Strategy Setup
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "myworldmywish";

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        // Change this line
        const user = await User.findById(jwt_payload.id);
        
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));
