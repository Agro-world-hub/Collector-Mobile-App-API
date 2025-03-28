const express = require('express');
const router = express.Router();
const CollectionEp = require('../end-point/collection-ep');
const auth = require('../Middlewares/auth.middleware');

// Get collection requests, with optional filters
router.get('/all-collectionrequest', auth, CollectionEp.getAllCollectionRequest);

module.exports = router;
