const express = require('express');
const router = express.Router();
const { getCollectionOfficers,getFarmerPaymentsSummary,getOfficerDetailsForReport } = require('../Controllers/manager.controller')
const authenticate = require('../Middlewares/auth.middleware');
const managerEp = require('../end-point/manager-ep');

// Route to get collection officers under a specific manager
router.get('/collection-officers', authenticate, getCollectionOfficers);

//Route to add a collection officer
router.post('/collection-officer/add', authenticate, managerEp.createCollectionOfficer);

// Route to fetch farmer payments summary
router.get(
  '/farmer-payments-summary',
  getFarmerPaymentsSummary // Controller function
);

// Route to get employee details by empId
router.get('/employee/:empId',getOfficerDetailsForReport );

//route to generate empId
router.get('/generate-empId/:role',managerEp.getForCreateId);


// Define the route for fetching farmer transaction list
router.get('/transaction-list', managerEp.getFarmerListByCollectionOfficerAndDate);


router.post('/get-claim-officer', managerEp.getClaimOfficer);

router.post('/claim-officer', managerEp.createClaimOfficer);

router.post('/disclaim-officer', managerEp.disclaimOfficer);

module.exports = router;
