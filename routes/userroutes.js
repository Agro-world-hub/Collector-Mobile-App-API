const express = require('express');
const router = express.Router();
const { login, updatePassword, getProfile, getUserDetails, updatePhoneNumber, getOfficerQRCode } = require('../Controllers/users.controller');
const auth = require('../Middlewares/auth.middleware');

// Route for login
router.post('/login', login);

// Route to change password
router.post('/change-password', updatePassword);

//User profile routes
router.get('/user-profile', auth, getProfile);

router.get('/profile-details', auth, getUserDetails);

router.put('/update-phone', auth, updatePhoneNumber);


router.get('/get-officer-Qr', auth, getOfficerQRCode);



module.exports = router;