// routes.js (or userRoutes.js)
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/search.controller');
const auth = require('../Middlewares/auth.middleware');

// Search for user by NICnumber
router.get('/search',auth , userController.searchUserByNIC);

module.exports = router;
