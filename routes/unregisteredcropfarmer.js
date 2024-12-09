const express = require('express');
const { addCropDetails, getAllCropNames, getVarietiesByCropId, getUnitPricesByCropId, getCropDetailsByUserId } = require('../Controllers/unregisteredcropfarmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

router.post('/add-crops', auth, addCropDetails);
router.get('/get-crop-names', getAllCropNames);
// Route to get varieties by crop name
router.get('/crops/varieties/:id', getVarietiesByCropId);

// Route to get unit prices by crop ID
router.get('/unitPrices/:cropId', getUnitPricesByCropId);

// Route to get today's crop details by userId
router.get('/user-crops/today/:userId', getCropDetailsByUserId);

module.exports = router;