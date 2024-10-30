const express = require('express');
const { addCropDetails ,getAllCropNames,getVarietiesByCropName,getUnitPricesByCropId} = require('../Controllers/unregisteredcropfarmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

router.post('/unregister-farmercrop',auth, addCropDetails);
router.get('/get-crop-names',getAllCropNames);
// Route to get varieties by crop name
router.get('/crops/varieties/:cropName', getVarietiesByCropName);

// Route to get unit prices by crop ID
router.get('/unitPrices/:cropId', getUnitPricesByCropId);

module.exports = router;