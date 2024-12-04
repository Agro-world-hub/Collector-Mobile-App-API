const express = require('express');
const db = require('./startup/database');
const cors = require('cors');
const collectionOfficerRoutes = require('./routes/userroutes'); // Import the routes
const addCropDetails = require('./routes/unregisteredcropfarmer');
const farmerRoutes = require('./routes/farmerrutes');
const bodyParser = require('body-parser');
const getUserdata = require('./routes/QRroutes')
const searchRoutes = require('./routes/search.routes')
const complainRoutes = require('./routes/complains.routes')

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
// Increase the payload limit
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as necessary
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// Routes
app.use('/api/collection-officer', collectionOfficerRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/unregisteredfarmercrop', addCropDetails);
app.use('/api/getUserData', getUserdata);
app.use('/api/auth', searchRoutes);
app.use('/api/auth', complainRoutes);



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));