const express = require('express');
const priceRequest = require('../Controllers/price.controller');
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

// Assuming authentication middleware sets req.user.id
router.post('/marketpricerequest', auth, priceRequest.insertMarketPriceRequestBatch);

module.exports = router;