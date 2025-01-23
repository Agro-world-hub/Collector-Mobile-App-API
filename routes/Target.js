const express = require('express');
const authMiddleware = require('../Middlewares/auth.middleware');
const TargetEP = require('../end-point/Target-ep')

const router = express.Router();


router.get(
    "/get-daily-target",
    authMiddleware,
    TargetEP.getTargetsByCompanyId
)





module.exports = router;