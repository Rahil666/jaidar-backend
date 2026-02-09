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

exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        let property = await Property.findOne({ where: { srm_id: id } });

        if (!property) {
            console.log(`Property ${id} not found in DB, fetching from external API...`);
            try {
                const response = await axios.get(`https://api.srminternationalrealestate.ae/api/properties/${id}`);
                const apiData = response.data;
                const item = apiData.Properties;

                if (item && item.id) {
                    // Upsert to DB
                    await Property.upsert({
                        srm_id: item.id,
                        title: item.title,
                        category: item.category,
                        location: item.location,
                        price: item.price,
                        description: item.description,
                        raw_data: item
                    });
                    
                    // Fetch the newly created/updated property
                    property = await Property.findOne({ where: { srm_id: item.id } });
                }
            } catch (apiError) {
                console.error(`Error fetching property ${id} from external API:`, apiError.message);
            }
        }

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // The user wants a specific response format: { "Properties": { ... } }
        // We use the raw_data stored in the DB if available, or construct it.
        const responseData = property.raw_data || {
            id: property.srm_id,
            title: property.title,
            category: property.category,
            location: property.location,
            price: property.price,
            description: property.description
        };

        res.json({
            Properties: responseData
        });
    } catch (error) {
        console.error('Error in getPropertyById:', error.message);
        res.status(500).json({ error: 'Failed to fetch property' });
    }
};
