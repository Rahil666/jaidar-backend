const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
    srm_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Store raw JSON if structure is complex or just selected fields?
    // For now, let's just match the key fields we saw in the JSON output earlier.
    // The previous JSON showed: id, title, category, location, price, property_image, description, etc.
    raw_data: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Property;
