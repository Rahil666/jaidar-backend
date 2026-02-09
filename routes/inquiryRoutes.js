const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

router.post('/inquiries', inquiryController.submitInquiry);

module.exports = router;
