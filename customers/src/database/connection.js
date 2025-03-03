const mongoose = require('mongoose');
const { DB_URL } = require('../config');

module.exports = async() => {
    try {
        console.log(`Attempting to connect to MongoDB at: ${DB_URL}`);
        mongoose.set('strictQuery', false);
        
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000
        });
        console.log('MongoDB Connected Successfully');
        
    } catch (error) {
        console.error('Error ============ ON DB Connection')
        console.log(error);
        // Print more details about the error
        if (error.name === 'MongoNetworkError') {
            console.error('MongoDB Network Error - Check if MongoDB is running and accessible');
        }
    }
};