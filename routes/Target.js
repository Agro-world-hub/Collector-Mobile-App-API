const express = require('express');
const authMiddleware = require('../Middlewares/auth.middleware');
const TargetEP = require('../end-point/Target-ep')

const router = express.Router();


router.get(
    "/get-daily-target-officer",
    authMiddleware,
    TargetEP.getTargetForOfficer
)


router.get(
    "/get-daily-target-officer/:officerId",
    TargetEP.getTargetForOfficer
)

router.get("/get-daily-center-target/:varietyId/:grade/:centerId",authMiddleware,TargetEP.getCenterTargetEp)

router.get('/officer',authMiddleware, TargetEP.getTargetForOfficerManagerView);
router.get('/officer/:officerId',authMiddleware, TargetEP.getTargetForOfficer);


module.exports = router;