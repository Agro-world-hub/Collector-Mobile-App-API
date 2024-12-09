// routes.js (or userRoutes.js)
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/search.controller');
const auth = require('../Middlewares/auth.middleware');

const serachFarmerEp = require('../end-point/searchFarmer-ep');

// Search for user by NICnumber
router.get('/getall', serachFarmerEp.getAllUsers);

module.exports = router;