const express = require('express');
const router = express.Router();
const { getCollectionOfficers,getFarmerPaymentsSummary,getOfficerDetailsForReport } = require('../Controllers/manager.controller')
const authenticate = require('../Middlewares/auth.middleware'); // Assuming you have an authentication middleware

// Route to get collection officers under a specific manager
router.get('/collection-officers', authenticate, getCollectionOfficers);

// Route to fetch farmer payments summary
router.get(
  '/farmer-payments-summary',
  getFarmerPaymentsSummary // Controller function
);

// Route to get employee details by empId
router.get('/employee/:empId',getOfficerDetailsForReport );

module.exports = router;
