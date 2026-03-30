const mongoose = require('mongoose');

async function connectToDB() {
    try {
        mongoose.set('bufferCommands', false);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('Connected to MongoDB');
        return true;
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = connectToDB;
