const express = require('express');
const router = express.Router();
const { login, updatePassword, getProfile, getUserDetails, updatePhoneNumber } = require('../Controllers/users.controller');
const auth = require('../Middlewares/auth.middleware');

const userAuthEp = require('../end-point/userAuth-ep');

// Route for login
router.post('/login', userAuthEp.loginUser);

// Route to change password
router.post('/change-password', updatePassword);

//User profile routes
router.get('/user-profile', auth, getProfile);

router.get('/profile-details', auth, getUserDetails);

router.put('/update-phone', auth, updatePhoneNumber);



module.exports = router;