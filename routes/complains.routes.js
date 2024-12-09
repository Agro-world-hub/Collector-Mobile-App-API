const express = require('express');
const { createFarmerComplaint } = require('../Controllers/complains.controller');
const router = express.Router();

const ComplaintEp = require('../end-point/complaint-ep')

// Middleware to authenticate and extract user info from token
const auth = require('../Middlewares/auth.middleware');

router.post('/farmer-complaint', auth, ComplaintEp.createFarmerComplaint);

module.exports = router;