const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const propertyRoutes = require('./routes/propertyRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).send('Jaidar Backend API is running 🚀');
});

// API Routes
app.use('/api', propertyRoutes);
app.use('/api', inquiryRoutes);

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        await sequelize.sync(); 
        console.log('Models synced...');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();

module.exports = app; // Export for Vercel
