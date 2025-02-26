const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async () => {
    const app = express();
    
    await databaseConnection();
    
    await expressApp(app);

    app.listen(PORT, () => {
        console.log(`Tenant service listening on port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    });
}

StartServer(); 