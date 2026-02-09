const express = require('express');
const cors = require('cors');
const sequelize = require('../config/database');
const propertyRoutes = require('../routes/propertyRoutes');
const inquiryRoutes = require('../routes/inquiryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).send('Jaidar Backend one again back to actionAPI is running 🚀');
});

// API Routes
app.use('/api', propertyRoutes);
app.use('/api', inquiryRoutes);

// Database Connection
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        // Sync models only if not on Vercel (read-only filesystem issue)
        // Or if you use a remote DB like MySQL, you can sync here.
        if (!process.env.VERCEL) {
            await sequelize.sync(); 
            console.log('Models synced...');
        }
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

initDB();

// Only listen locally, Vercel handles the listener for us
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app; // Export for Vercel
