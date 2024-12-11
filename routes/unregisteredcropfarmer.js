const express = require('express');
const { addCropDetails, getAllCropNames, getVarietiesByCropId, getUnitPricesByCropId, getCropDetailsByUserId } = require('../Controllers/unregisteredcropfarmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();
const unRegisterdcropfamerEp = require('../end-point/unRegisteredCropFarmer-ep');

router.post('/add-crops', auth, unRegisterdcropfamerEp.addCropDetails);
router.post('/add-crops2', auth, unRegisterdcropfamerEp.addCropDetails2); 
router.get('/get-crop-names', unRegisterdcropfamerEp.getAllCropNames);
// Route to get varieties by crop name
router.get('/crops/varieties/:id',unRegisterdcropfamerEp.getVarietiesByCropId);

// Route to get unit prices by crop ID
router.get('/unitPrices/:cropId',unRegisterdcropfamerEp.getUnitPricesByCropId);

// Route to get today's crop details by userId
router.get('/user-crops/today/:userId',unRegisterdcropfamerEp.getCropDetailsByUserId);

module.exports = router;