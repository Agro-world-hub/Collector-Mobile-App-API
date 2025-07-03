const express = require('express');
const router = express.Router();
const authenticate = require('../Middlewares/auth.middleware');
const dmanagerEp = require('../end-point/distributionManger-ep');
const TargetEP = require('../end-point/Target-ep')
const upload = require('../Middlewares/multer.middleware');
const auth = require('../Middlewares/auth.middleware');

// Route to get collection officers under a specific manager
// router.get('/collection-officers', authenticate, dmanagerEp.getCollectionOfficers);
router.get('/user-profile', auth, dmanagerEp.getProfile);

module.exports = router;