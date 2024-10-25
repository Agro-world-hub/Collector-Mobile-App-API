const express = require('express');
const { createFarmerComplaint } = require('../Controllers/complains.controller');
const router = express.Router();

// Middleware to authenticate and extract user info from token
const authenticate = require('../Middlewares/auth.middleware');

router.post('/farmer-complaint', authenticate, createFarmerComplaint);

module.exports = router;