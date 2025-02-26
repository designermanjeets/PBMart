const mongoose = require('mongoose');
const { DB_URL } = require('../config');

module.exports = async () => {
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Tenant Database Connected');
    } catch (error) {
        console.error('Error connecting to tenant database:', error);
        process.exit(1);
    }
}; 