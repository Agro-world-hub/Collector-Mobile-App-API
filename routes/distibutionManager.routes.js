const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/auth.middleware');
const dmanagerEp = require('../end-point/distributionManger-ep');
const TargetEP = require('../end-point/Target-ep');
const upload = require('../Middlewares/multer.middleware');

// Get distribution center targets (nested structure)
router.get("/get-dcenter-target", authenticate, dmanagerEp.getDCenterTarget);

// // Alternative endpoint - Get distribution center targets (separate arrays)
// router.get("/get-dcenter-target-separate", authenticate, dmanagerEp.getDCenterTargetSeparate);

module.exports = router;