const axios = require('axios');
const Property = require('../models/Property');

const isCloudEnv = process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production';

exports.getProperties = async (req, res) => {
    try {
        // Fetch from external API
        const response = await axios.get('https://api.srminternationalrealestate.ae/api/properties');
        const apiData = response.data;
        const propertiesList = apiData.Properties || [];

        // Only save to DB if running locally (not on Vercel)
        if (!isCloudEnv) {
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
        }

        // Return the data
        res.json({
            message: 'Properties fetched successfully',
            count: propertiesList.length,
            data: propertiesList
        });
    } catch (error) {
        console.error('Error in getProperties:', error.message);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        // On Vercel: Pure proxy mode - fetch directly from external API
        if (isCloudEnv) {
            try {
                const response = await axios.get(`https://api.srminternationalrealestate.ae/api/properties/${id}`);
                return res.json(response.data);
            } catch (apiError) {
                if (apiError.response && apiError.response.status === 404) {
                    return res.status(404).json({ error: 'Property not found' });
                }
                throw apiError;
            }
        }

        // Local mode: Check DB first, then fallback to external API
        let property = await Property.findOne({ where: { srm_id: id } });

        if (!property) {
            console.log(`Property ${id} not found in DB, fetching from external API...`);
            try {
                const response = await axios.get(`https://api.srminternationalrealestate.ae/api/properties/${id}`);
                const apiData = response.data;
                const item = apiData.Properties;

                if (item && item.id) {
                    await Property.upsert({
                        srm_id: item.id,
                        title: item.title,
                        category: item.category,
                        location: item.location,
                        price: item.price,
                        description: item.description,
                        raw_data: item
                    });
                    property = await Property.findOne({ where: { srm_id: item.id } });
                }
            } catch (apiError) {
                console.error(`Error fetching property ${id} from external API:`, apiError.message);
            }
        }

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

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
