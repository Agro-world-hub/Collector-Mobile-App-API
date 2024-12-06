const express = require('express');
const router = express.Router();
const {  updatePassword, getProfile, getUserDetails, updatePhoneNumber } = require('../Controllers/users.controller');
const auth = require('../Middlewares/auth.middleware');

const userAuthEp = require('../end-point/userAuth-ep');

router.post('/login', userAuthEp.loginUser);
router.post('/change-password', userAuthEp.updatePassword);

//User profile routes
router.get('/user-profile', auth, getProfile);

router.get('/profile-details', auth, getUserDetails);

router.put('/update-phone', auth, updatePhoneNumber);



module.exports = router;