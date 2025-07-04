const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/auth.middleware');
const dmanagerEp = require('../end-point/distributionManger-ep');
const TargetEP = require('../end-point/Target-ep');
const upload = require('../Middlewares/multer.middleware');
const auth = require('../Middlewares/auth.middleware');

// Get distribution center targets (nested structure)
router.get("/get-dcenter-target", authenticate, dmanagerEp.getDCenterTarget);

router.get('/get-replacerequest', auth, dmanagerEp.getAllReplaceRequests);

// // Alternative endpoint - Get distribution center targets (separate arrays)
// router.get("/get-dcenter-target-separate", authenticate, dmanagerEp.getDCenterTargetSeparate);
// Route to get collection officers under a specific manager
// router.get('/collection-officers', authenticate, dmanagerEp.getCollectionOfficers);
router.get('/user-profile', auth, dmanagerEp.getProfile);

module.exports = router;