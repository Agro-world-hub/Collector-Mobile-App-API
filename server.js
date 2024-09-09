const express = require('express');
const db = require('./startup/database'); 
const cors = require('cors');
// const routes = require('./routes/Admin');
require('dotenv').config();
 

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:"*"}));

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database in index.js:', err);
    return;
  }
  console.log('Connected to the MySQL database in server.js.');
});

// app.use(process.env.AUTHOR, routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});