const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/auth.middleware');
const managerEp = require('../end-point/manager-ep');
const TargetEP = require('../end-point/Target-ep')
const  upload  = require('../Middlewares/multer.middleware') ;

// Route to get collection officers under a specific manager
router.get('/collection-officers', authenticate, managerEp.getCollectionOfficers);

//Route to add a collection officer
router.post('/collection-officer/add', authenticate, upload.single("image"), managerEp.createCollectionOfficer);

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

router.get('/my-collection',authenticate, managerEp.getFarmerListByCollectionOfficerAndDateForManager);


router.post('/get-claim-officer', managerEp.getClaimOfficer);

router.post('/claim-officer', managerEp.createClaimOfficer);

router.post('/disclaim-officer', managerEp.disclaimOfficer);

//Route for the farmers transcation details for the manager report
router.get('/transaction-details/:userId/:createdAt/:farmerId', managerEp.GetFarmerReportDetails);



//target routes 

router.get(
    '/get-crop-category',
    TargetEP.getAllCropCatogory
)

router.post(
    "/create-daily-target",
    authenticate,
    TargetEP.addDailyTarget
)

router.get(
    "/get-daily-target",
    authenticate,
    TargetEP.getAllDailyTarget
)

router.get(
    "/download-daily-target",
    authenticate,
    TargetEP.downloadDailyTarget
)

router.get("/targets", TargetEP.getAllTargets);

router.post("/get-officer-online", managerEp.getofficeronline);


module.exports = router;
