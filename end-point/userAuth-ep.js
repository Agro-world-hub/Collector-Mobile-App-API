const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const userAuthDao = require("../dao/userAuth-dao");

exports.loginUser = async (req, res) => {
  try {
    console.log("JWT Secret:", process.env.JWT_SECRET);

    // Validate the request body

    const { empid, password } = req.body;
    console.log("Attempting login for email:", empid);
    const collectionOfficerIdResult = await userAuthDao.getOfficerEmployeeId(empid);
    const collectionOfficerId = collectionOfficerIdResult[0]?.collectionOfficerId;
    
    console.log("Collection Officer ID:", collectionOfficerId);
    // Fetch user details from the database
    const users = await userAuthDao.getOfficerPasswordBy(collectionOfficerId, password);

    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const officer = users[0]; // Get the first user in the array

    // Create the JWT payload
    const payload = {
      id: officer.id,
      email: officer.email,
      firstNameEnglish: officer.firstNameEnglish,
      lastNameEnglish: officer.lastNameEnglish,
      phoneNumber01: officer.phoneNumber01, // Include phone number
    };

    // Generate the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET || T1, {
      expiresIn: "10h",
    });

    // Determine if a password update is required
    const passwordUpdateRequired = !officer.passwordUpdated;

    // Build the response object
    const response = {
      status: "success",
      message: passwordUpdateRequired
        ? "Login successful, but password update is required"
        : "Login successful",
      officer: payload,
      passwordUpdateRequired,
      token,
      userid:officer.id
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Login Error:", err);

    if (err.isJoi) {
      // Validation error
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    // Handle other errors
    res.status(500).json({
      status: "error",
      message: "An error occurred during login.",
    });
  }
};

exports.updatePassword = async (req, res) => {

    const { empid, currentPassword, newPassword } = req.body;
    console.log("Attempting to update password for empid:",  empid);
    // Validate inputs
    if (! empid|| !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const collectionOfficerIdResult = await userAuthDao.getOfficerEmployeeId(empid);
    const collectionOfficerId = collectionOfficerIdResult[0]?.collectionOfficerId;
    console.log("Collection Officer ID:", collectionOfficerId);

    try {
        // Update the password in the database
        await userAuthDao.updatePasswordInDatabase( collectionOfficerId, newPassword);

        // Send success response
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        // Specific error handling based on the error type or message
        if (error === 'Database error') {
            return res.status(500).json({ message: 'Database error occurred while updating the password' });
        } else if (error === 'Current password is incorrect') {
            return res.status(401).json({ message: 'Current password is incorrect' });
        } else {
            // General error handling
            return res.status(500).json({ message: 'An error occurred while updating the password' });
        }
    }
};

