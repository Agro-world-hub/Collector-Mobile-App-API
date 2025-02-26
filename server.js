const express = require('express');

const cors = require('cors');
const addCropDetails = require('./routes/unregisteredcropfarmer');
const farmerRoutes = require('./routes/farmerrutes');
const bodyParser = require('body-parser');
const getUserdata = require('./routes/QRroutes')

const complainRoutes = require('./routes/complains.routes')
const priceUpdatesRoutes = require('./routes/price.routes')
const managerRoutes = require('./routes/manager.routes')
const {  plantcare, collectionofficer, marketPlace, dash } = require('./startup/database');
const socketIo = require('socket.io');
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

const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://1192.168.1.5:3000/",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`${socket.id} user is just connected`);
  socket.on('updateOfficerStatus', (data) => {
    const { status, token } = data;
  });
  socket.on('disconnect', () => {
    console.log(`${socket.id} user is disconnected`);
  });

});

// Increase the payload limit
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as necessary
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// Function to test database connections using the pool
const testConnection = (pool, name) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error(`❌ Error connecting to the ${name} database:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Successfully connected to the MySQL database: ${name}`);
        connection.release(); // Release the connection back to the pool
        resolve();
      }
    });
  });
};

// Test all database connections sequentially
const checkConnections = async () => {
  console.log('🔄 Testing database connections...\n');
  try {
    await testConnection(plantcare, 'PlantCare');
    await testConnection(collectionofficer, 'CollectionOfficer');
    await testConnection(marketPlace, 'MarketPlace');
    await testConnection(dash, 'Dash');
    console.log('\n🎉 All databases connected successfully!\n');
  } catch (error) {
    console.error('\n⚠️ Some databases failed to connect. Check logs above.\n');
  }
};

// Run connection tests
checkConnections();


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
app.use('/api/collection-manager',managerRoutes);


const targetRoutes = require('./routes/Target')
app.use('/api/target', targetRoutes);





// Start server
const PORT = process.env.PORT || 3000;
const PORT2 = 3005
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
http.listen(PORT2, () => {
  console.log(`Server is listeing on ${PORT2}`);
});
