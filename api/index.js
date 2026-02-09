const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if we're in a cloud environment (no persistent filesystem)
const isCloudEnv = process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Only load sequelize and routes that need DB locally
let sequelize, propertyRoutes, inquiryRoutes;

try {
    sequelize = require('../config/database');
    propertyRoutes = require('../routes/propertyRoutes');
    inquiryRoutes = require('../routes/inquiryRoutes');
} catch (error) {
    console.error('Error loading modules:', error.message);
}

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).send('Jaidar Backend API is running 🚀');
});

// API Routes
if (propertyRoutes) app.use('/api', propertyRoutes);
if (inquiryRoutes) app.use('/api', inquiryRoutes);

// Database Connection (skip in cloud environments with read-only filesystem)
const initDB = async () => {
    if (!sequelize) return;
    
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        // Only sync if not in cloud environment
        if (!isCloudEnv) {
            await sequelize.sync(); 
            console.log('Models synced...');
        }
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

initDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
