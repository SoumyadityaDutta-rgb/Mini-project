const mongoose = require('mongoose');
require('dotenv').config();

const fixLikedSongs = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Get the users collection
        const User = mongoose.connection.collection('users');
        
        // Find all users
        const users = await User.find({}).toArray();
        console.log(`Found ${users.length} users`);

        // Update each user
        for (const user of users) {
            try {
                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            likedSongs: Array.isArray(user.likedSongs) ? user.likedSongs : [],
                            likedPlaylists: Array.isArray(user.likedPlaylists) ? user.likedPlaylists : [],
                            subscribedArtists: Array.isArray(user.subscribedArtists) ? user.subscribedArtists : []
                        }
                    }
                );
                console.log(`Updated user ${user._id}`);
            } catch (err) {
                console.error(`Error updating user ${user._id}:`, err);
            }
        }

        console.log('Migration completed');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
fixLikedSongs(); 