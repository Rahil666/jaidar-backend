const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const propertyRoutes = require('./api/propertyRoutes');
const inquiryRoutes = require('./api/inquiryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', propertyRoutes);
app.use('/api', inquiryRoutes);

// Error handlers to prevent silent crashes and provide more info
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        await sequelize.sync(); 
        console.log('Models synced...');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            
            // Heartbeat to monitor stability
            setInterval(() => {
                console.log(`[${new Date().toLocaleTimeString()}] Server is alive on port ${PORT}`);
            }, 10000);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); 
    }
};

startServer();
