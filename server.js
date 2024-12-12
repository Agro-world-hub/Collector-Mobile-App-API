const express = require('express');
const db = require('./startup/database');
const cors = require('cors');
const addCropDetails = require('./routes/unregisteredcropfarmer');
const farmerRoutes = require('./routes/farmerrutes');
const bodyParser = require('body-parser');
const getUserdata = require('./routes/QRroutes')

const complainRoutes = require('./routes/complains.routes')
const priceUpdatesRoutes = require('./routes/price.routes')

require('dotenv').config();

const app = express();

// Middleware
app.use(
    cors({
        origin: "http://localhost:8081", // The client origin that is allowed to access the resource
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
        credentials: true, // Allow credentials (cookies, auth headers)
    })
);
app.options(
    "*",
    cors({
        origin: "http://localhost:8081", // Allow the client origin for preflight
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods for the preflight response
        credentials: true,
    })
);
// Increase the payload limit
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as necessary
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// Routes
const collectionOfficerRoutes = require('./routes/userroutes')
app.use('/api/collection-officer', collectionOfficerRoutes);

app.use('/api/farmer', farmerRoutes);
app.use('/api/unregisteredfarmercrop', addCropDetails);
app.use('/api/getUserData', getUserdata);

const searchRoutes = require('./routes/search.routes')
app.use('/api/auth', searchRoutes);

app.use('/api/auth', complainRoutes);
app.use('/api/auth', priceUpdatesRoutes);



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));