const axios = require('axios');
const Property = require('../models/Property');

exports.getProperties = async (req, res) => {
    try {
        // Fetch from external API
        const response = await axios.get('https://api.srminternationalrealestate.ae/api/properties');
        const apiData = response.data;

        // The API returns an object with a "Properties" array, or maybe just an array? 
        // Based on previous tool output: {"Properties":[{"id":290,...}]}
        const propertiesList = apiData.Properties || [];

        // Save to DB (Upsert)
        for (const item of propertiesList) {
            await Property.upsert({
                srm_id: item.id,
                title: item.title,
                category: item.category,
                location: item.location,
                price: item.price,
                description: item.description,
                raw_data: item
            });
        }

        // Return the data
        res.json({
            message: 'Properties fetched and synced successfully',
            count: propertiesList.length,
            data: propertiesList
        });
    } catch (error) {
        console.error('Error in getProperties:', error.message);
        res.status(500).json({ error: 'Failed to fetch/sync properties' });
    }
};
