// const express = require('express');
// const cors = require('cors');
// const addCropDetails = require('./routes/unregisteredcropfarmer');
// const farmerRoutes = require('./routes/farmerrutes');
// const bodyParser = require('body-parser');
// const getUserdata = require('./routes/QRroutes');
// const complainRoutes = require('./routes/complains.routes');
// const priceUpdatesRoutes = require('./routes/price.routes');
// const managerRoutes = require('./routes/manager.routes');
// const { plantcare, collectionofficer, marketPlace, dash } = require('./startup/database');
// const heathRoutes = require("./routes/heathRoutes");

// const socketIo = require('socket.io');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(
//   cors({
//     origin: "http://localhost:8081", // The client origin that is allowed to access the resource
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
//     credentials: true, // Allow credentials (cookies, auth headers)
//   })
// );
// app.options(
//   "*",
//   cors({
//     origin: "http://localhost:8081", // Allow the client origin for preflight
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods for the preflight response
//     credentials: true,
//   })
// );

// const httpServer = require("http").Server(app);
// const io = socketIo(httpServer, {
//   cors: {
//     origin: "http://localhost:8081", // Frontend's origin
//     methods: ["GET", "POST"]
//   }
// });

// const socket = require('./end-point/socket-ep');
// io.on("connection",socket.handleConnection );


// // //Socket.IO connection handler
// // io.on("connection", (socket) => {
// //   console.log(`${socket.id} user connected`);
  


// //   // Handle 'login' event to mark user as online
// //   socket.on('login', async (empId) => {
// //     console.log(`Employee ${empId} logged in`);

// //     // Update online status in the database
// //     try {
// //       await collectionofficer.promise().query('UPDATE collectionofficer SET onlineStatus = ? WHERE empId = ?', [true, empId]);
// //       console.log(`Employee ${empId} marked as online in the database.`);
// //     } catch (err) {
// //       console.error('Error updating employee online status:', err);
// //     }

// //     // Emit an event to inform other users of the new user online
// //     socket.broadcast.emit('employeeOnline', { empId });
// //   });

// //   // When the user disconnects, mark them as offline
// //   socket.on('disconnect', async () => {
// //     let empId = socket.id; // You might store empId with the socket or use socket.id

// //     console.log(`Employee ${empId} disconnected`);

// //     // Update online status in the database
// //     try {
// //       await collectionofficer.promise().query('UPDATE collectionofficer SET onlineStatus = ? WHERE empId = ?', [false, empId]);
// //       console.log(`Employee ${empId} marked as offline in the database.`);
// //     } catch (err) {
// //       console.error('Error updating employee offline status:', err);
// //     }

// //     // Emit an event to inform other users that this user went offline
// //     socket.broadcast.emit('employeeOffline', { empId });
// //   });
// // });


// // let officerStatus = [];  // Stores the list of officers and their statuses

// // // Socket.IO connection handler
// // io.on("connection", (socket) => {
// //   console.log(`${socket.id} user connected`);

// //   // // Create officer and mark them as online
// //   // socket.on("createOfficer", (empId) => {
// //   //   console.log(`Creating officer with empId: ${empId}`);

// //   //   // Add officer to the list with 'online' status
// //   //   officerStatus.unshift({
// //   //     id: officerStatus.length + 1,
// //   //     empId,
// //   //     status: "online",
// //   //   });

// //   //   // Emit the updated officer list to the client
// //   //   socket.emit("officersList", officerStatus);
// //   // });

// //   // // Find officer by empId
// //   // socket.on("findOfficer", (empId) => {
// //   //   const filteredOfficer = officerStatus.find((item) => item.empId === empId);

// //   //   if (filteredOfficer) {
// //   //     // Emit the officer's status (online/offline) to the requesting client
// //   //     socket.emit("foundOfficer", filteredOfficer.status);
      
// //   //     console.log(`Employee ${empId} found with status: ${filteredOfficer.status}`);
// //   //   } else {
// //   //     socket.emit("foundOfficer", "offline"); // Default to offline if not found
// //   //   }
// //   // });

// //   // Handle 'login' event to mark officer as online
// //   socket.on("login", async (empId) => {
// //     console.log(`Employee ${empId} logged in`);

// //     // Update online status in the database
// //     try {
// //       await collectionofficer.promise().query('UPDATE collectionofficer SET onlineStatus = ? WHERE empId = ?', [true, empId]);
// //       console.log(`Employee ${empId} marked as online in the database.`);

// //       // Update officer status in the officerStatus array
// //       const officer = officerStatus.find((item) => item.empId === empId);
// //       if (officer) {
// //         officer.status = "online"; // Update the status to online
// //       } else {
// //         // Add the officer if not found
// //         officerStatus.unshift({ empId, status: "online" });
// //       }

// //       // Emit event to inform other users that the officer is online
// //       socket.broadcast.emit("employeeOnline", { empId });

// //     } catch (err) {
// //       console.error("Error updating employee online status:", err);
// //     }
// //   });

// //   // When the user disconnects, mark them as offline
// //   socket.on("disconnect", async () => {
// //     let empId = socket.data.empId; // You should store empId with the socket

// //     if (!empId) {
// //       console.log("Disconnected user does not have an empId");
// //       return;
// //     }

// //     console.log(`Employee ${empId} disconnected`);

// //     // Update online status in the database
// //     try {
// //       await collectionofficer.promise().query('UPDATE collectionofficer SET onlineStatus = ? WHERE empId = ?', [false, empId]);
// //       console.log(`Employee ${empId} marked as offline in the database.`);

// //       // Update officer status in the officerStatus array
// //       const officer = officerStatus.find((item) => item.empId === empId);
// //       if (officer) {
// //         officer.status = "offline"; // Update the status to offline
// //       }

// //       // Emit event to inform other users that this officer is offline
// //       socket.broadcast.emit("employeeOffline", { empId });

// //     } catch (err) {
// //       console.error("Error updating employee offline status:", err);
// //     }
// //   });
// // });


// // Function to test database connections using the pool
// const testConnection = (pool, name) => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) {
//         console.error(`❌ Error connecting to the ${name} database:`, err.message);
//         reject(err);
//       } else {
//         console.log(`✅ Successfully connected to the MySQL database: ${name}`);
//         connection.release(); // Release the connection back to the pool
//         resolve();
//       }
//     });
//   });
// };



// // Test all database connections sequentially
// const checkConnections = async () => {
//   console.log('🔄 Testing database connections...\n');
//   try {
//     await testConnection(plantcare, 'PlantCare');
//     await testConnection(collectionofficer, 'CollectionOfficer');
//     await testConnection(marketPlace, 'MarketPlace');
//     await testConnection(dash, 'Dash');
//     console.log('\n🎉 All databases connected successfully!\n');
//   } catch (error) {
//     console.error('\n⚠️ Some databases failed to connect. Check logs above.\n');
//   }
// };

// // Run connection tests
// checkConnections();

// // Increase the payload limit
// app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as necessary
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// // Routes
// const collectionOfficerRoutes = require('./routes/userroutes');
// app.use('/api/collection-officer', collectionOfficerRoutes);
// app.use('/api/farmer', farmerRoutes);
// app.use('/api/unregisteredfarmercrop', addCropDetails);
// app.use('/api/getUserData', getUserdata);
// const searchRoutes = require('./routes/search.routes');
// app.use('/api/auth', searchRoutes);
// app.use('/api/auth', complainRoutes);
// app.use('/api/auth', priceUpdatesRoutes);
// app.use('/api/collection-manager', managerRoutes);
// const targetRoutes = require('./routes/Target');
// app.use('/api/target', targetRoutes);

// app.use("", heathRoutes);

// // Start HTTP server
// const PORT = process.env.PORT || 3000;
// const PORT2 = process.env.PORT2 || 3005;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// httpServer.listen(PORT2, () => {
//   console.log(`Socket.IO server listening on port ${PORT2}`);
// });

const express = require('express');
const cors = require('cors');
const addCropDetails = require('./routes/unregisteredcropfarmer');
const farmerRoutes = require('./routes/farmerrutes');
const bodyParser = require('body-parser');
const getUserdata = require('./routes/QRroutes');
const complainRoutes = require('./routes/complains.routes');
const priceUpdatesRoutes = require('./routes/price.routes');
const managerRoutes = require('./routes/manager.routes');
const { plantcare, collectionofficer, marketPlace, dash, admin } = require('./startup/database');
const heathRoutes = require("./routes/heathRoutes");

const socketIo = require('socket.io');
require('dotenv').config();

// Create separate Express apps for different base paths
const mainApp = express();
const statusApp = express();

// Middleware for both apps
[mainApp, statusApp].forEach(app => {
  app.use(
    cors({
      origin: "http://localhost:8081",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
  app.options(
    "*",
    cors({
      origin: "http://localhost:8081",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
});

const httpsServer = require("http").Server(statusApp);
const io = socketIo(httpsServer, {
  cors: {
    origin: "*",// Frontend's origin
    methods: ["GET", "POST"]
  }
});

const socket = require('./end-point/socket-ep');
io.on("connection",socket.handleConnection );

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
    await testConnection(admin, 'Admin');
    console.log('\n🎉 All databases connected successfully!\n');
  } catch (error) {
    console.error('\n⚠️ Some databases failed to connect. Check logs above.\n');
  }
};

// Run connection tests
checkConnections();

// Routes for main API (PORT 3000)
const basePathMain = '/agro-api/collection-api';
const collectionOfficerRoutes = require('./routes/userroutes');
mainApp.use(`${basePathMain}/api/collection-officer`, collectionOfficerRoutes);
mainApp.use(`${basePathMain}/api/farmer`, farmerRoutes);
mainApp.use(`${basePathMain}/api/unregisteredfarmercrop`, addCropDetails);
mainApp.use(`${basePathMain}/api/getUserData`, getUserdata);
const searchRoutes = require('./routes/search.routes');
mainApp.use(`${basePathMain}/api/auth`, searchRoutes);
mainApp.use(`${basePathMain}/api/auth`, complainRoutes);
mainApp.use(`${basePathMain}/api/auth`, priceUpdatesRoutes);
mainApp.use(`${basePathMain}/api/collection-manager`, managerRoutes);
const targetRoutes = require('./routes/Target');
mainApp.use(`${basePathMain}/api/target`, targetRoutes);
mainApp.use(`${basePathMain}`, heathRoutes);

// Routes for status API (PORT 3005)
const basePathStatus = '/agro-api/collection-status';
statusApp.use(basePathStatus, heathRoutes);

// Start servers
const PORT = process.env.PORT || 3000;
const PORT2 = process.env.PORT2 || 3005;

mainApp.listen(PORT, () => console.log(`Main API server running on port ${PORT} with base path ${basePathMain}`));
httpsServer.listen(PORT2, () => {
  console.log(`Socket.IO server listening on port ${PORT2} with base path ${basePathStatus}`);
});
