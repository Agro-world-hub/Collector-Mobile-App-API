const db = require('../startup/database');

// Controller to handle both user details and payment details
const addUserAndPaymentDetails = (req, res) => {

  const { 
    firstName, 
    lastName, 
    NICnumber, 
    phoneNumber, 
    address,
    accNumber, 
    accHolderName, 
    bankName, 
    branchName
  } = req.body;

  // Validation: Check if all fields are filled
  if (!firstName || !lastName || !NICnumber || !phoneNumber || !address || !accNumber || !accHolderName || !bankName || !branchName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Start a transaction
  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json({ error: "Transaction failed to start" });
    }

    // Insert into the 'users' table
    const userSql = `
      INSERT INTO users (firstName, lastName, NICnumber, phoneNumber)
      VALUES (?, ?, ?, ?)
    `;

    db.query(userSql, [firstName, lastName, NICnumber, phoneNumber], (userError, userResult) => {
      if (userError) {
        return db.rollback(() => {
          res.status(500).json({ error: userError.message });
        });
      }
      
      console.log(userResult.insertId);
      
      const userId = userResult.insertId;

      // Insert into the 'userbankdetails' table
      const paymentSql = `
        INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(paymentSql, [userId, address, accNumber, accHolderName, bankName, branchName], (paymentError, paymentResult) => {
        if (paymentError) {
          return db.rollback(() => {
            res.status(500).json({ error: paymentError.message });
          });
        }

        // Commit the transaction
        db.commit((commitError) => {
          if (commitError) {
            return db.rollback(() => {
              res.status(500).json({ error: "Transaction commit failed" });
            });
          }
          res.status(201).json({ 
            message: "User and bank details added successfully", 
            userId: userId, 
            paymentId: paymentResult.insertId 
          });
        });
      });
    });
  });
};

module.exports = { addUserAndPaymentDetails };
