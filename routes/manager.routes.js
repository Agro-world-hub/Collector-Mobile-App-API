const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/auth.middleware');
const managerEp = require('../end-point/manager-ep');

// Route to get collection officers under a specific manager
router.get('/collection-officers', authenticate, managerEp.getCollectionOfficers);

//Route to add a collection officer
router.post('/collection-officer/add', authenticate, managerEp.createCollectionOfficer);

// Route to fetch farmer payments summary
router.get(
  '/farmer-payments-summary',
  managerEp.getFarmerPaymentsSummary // Controller function
);

// Route to get employee details by empId
router.get('/employee/:empId',managerEp.getOfficerDetailsForReport );

//route to generate empId
router.get('/generate-empId/:role',managerEp.getForCreateId);


// Define the route for fetching farmer transaction list
router.get('/transaction-list', managerEp.getFarmerListByCollectionOfficerAndDate);

//Route for the farmers transcation details for the manager report
router.get('/transaction-details/:userId/:createdAt/:farmerId', managerEp.GetFarmerReportDetails);


module.exports = router;
