const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const userAuthDao = require("../dao/userAuth-dao");

exports.loginUser = async (req, res) => {
  try {
    console.log("JWT Secret:", process.env.JWT_SECRET);

    // Validate the request body

    const { email, password } = req.body;
    console.log("Attempting login for email:", email);

    // Fetch user details from the database
    const users = await userAuthDao.getOfficerByEmailAndPassword(email, password);

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
