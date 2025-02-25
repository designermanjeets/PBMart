const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async () => {
    try {
        const app = express();
        
        // Connect to database
        await databaseConnection();
        
        // Initialize express app
        await expressApp(app);
        
        app.listen(PORT, () => {
            console.log(`Products service listening on port ${PORT}`);
        })
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

StartServer();
