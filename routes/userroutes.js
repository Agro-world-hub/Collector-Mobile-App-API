const express = require('express');
const router = express.Router();
const { login, updatePassword,getProfile } = require('../Controllers/users.controller');
const auth = require('../Middlewares/auth.middleware');

// Route for login
router.post('/login', login);

// Route to change password
router.post('/change-password', updatePassword);

//User profile routes
router.get('/user-profile', auth, getProfile);

module.exports = router;
