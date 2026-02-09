const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/properties', propertyController.getProperties);
router.get('/properties/:id', propertyController.getPropertyById);

module.exports = router;
