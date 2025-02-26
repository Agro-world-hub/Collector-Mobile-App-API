const express = require('express');
const router = express.Router();
const { getOfficerQRCode  } = require('../Controllers/users.controller');
const auth = require('../Middlewares/auth.middleware');

const userAuthEp = require('../end-point/userAuth-ep');

router.post('/login', userAuthEp.loginUser);
router.post('/change-password', userAuthEp.updatePassword);

router.get('/user-profile', auth, userAuthEp.getProfile);

router.get('/profile-details', auth, userAuthEp.getUserDetails);

router.put('/update-phone', auth, userAuthEp.updatePhoneNumber);

router.get('/get-officer-Qr', auth, userAuthEp.getOfficerQRCode);

router.get('/get-claim-status', auth, userAuthEp.GetClaimStatus);

// router.post("/update-officer-status", auth, userAuthEp.updateOnlineStatus);



module.exports = router;