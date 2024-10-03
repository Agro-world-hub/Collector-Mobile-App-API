const express = require('express');
const { addCropDetails } = require('../Controllers/unregisteredcropfarmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

router.post('/unregister-farmercrop',auth, addCropDetails);

module.exports = router;