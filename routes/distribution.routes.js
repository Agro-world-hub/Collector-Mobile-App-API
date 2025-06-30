const express = require('express');
const router = express.Router();
const DistributionEp = require('../end-point/distribution-ep');
const auth = require('../Middlewares/auth.middleware');

// Get collection requests, with optional filters
router.get('/officer-target', auth, DistributionEp.getOfficerTarget);

router.get('/order-data/:orderId', auth, DistributionEp.getOrderData);

// In your distribution routes file (distribution-rt.js)
router.put('/update-order/:orderId', auth, DistributionEp.updateOrderItems);

router.get('/all-retail-items', auth, DistributionEp.getAllRetailItems);

router.post('/replace-order-package', auth, DistributionEp.replaceOrderPackage);

router.get("/get-distribution-target", auth, DistributionEp.getDistributionTarget)


// Add this route to your router file
router.put('/update-distributed-target/:orderId', auth, DistributionEp.updateDistributedTarget);

module.exports = router;
