const express = require('express');
const priceRequest = require('../Controllers/price.controller');
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();
const marketPrice = require('../end-point/marketPrice-ep')

// Assuming authentication middleware sets req.user.id
// router.post('/marketpricerequest', auth, priceRequest.insertMarketPriceRequestBatch);
router.post('/marketpricerequest', auth, marketPrice.insertMarketPriceRequestBatch);
module.exports = router;