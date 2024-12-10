const jwt = require("jsonwebtoken");
const userAuthDao = require("../dao/userAuth-dao");

exports.loginUser = async (req, res) => {
  try {
    console.log("JWT Secret:", process.env.JWT_SECRET);

    // Validate the request body

    const { empid, password } = req.body;
    console.log("Attempting login for email:", empid);
    const collectionOfficerIdResult = await userAuthDao.getOfficerEmployeeId(
      empid
    );
    const collectionOfficerId =
      collectionOfficerIdResult[0]?.collectionOfficerId;

    console.log("Collection Officer ID:", collectionOfficerId);
    // Fetch user details from the database
    const users = await userAuthDao.getOfficerPasswordBy(
      collectionOfficerId,
      password
    );

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
      userid: officer.id,
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
  console.log("Attempting to update password for empid:", empid);
  // Validate inputs
  if (!empid || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const collectionOfficerIdResult = await userAuthDao.getOfficerEmployeeId(
    empid
  );
  const collectionOfficerId = collectionOfficerIdResult[0]?.collectionOfficerId;
  console.log("Collection Officer ID:", collectionOfficerId);

  try {
    // Update the password in the database
    await userAuthDao.updatePasswordInDatabase(
      collectionOfficerId,
      newPassword
    );

    // Send success response
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    // Specific error handling based on the error type or message
    if (error === "Database error") {
      return res
        .status(500)
        .json({
          message: "Database error occurred while updating the password",
        });
    } else if (error === "Current password is incorrect") {
      return res.status(401).json({ message: "Current password is incorrect" });
    } else {
      // General error handling
      return res
        .status(500)
        .json({ message: "An error occurred while updating the password" });
    }
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userAuthDao.getProfileById(userId);

    res.status(200).json({
      status: "success",
      user: {
        firstNameEnglish: user.firstNameEnglish,
        firstNameSinhala: user.firstNameSinhala,
        firstNameTamil: user.firstNameTamil,
        lastNameEnglish: user.lastNameEnglish,
        lastNameSinhala: user.lastNameSinhala,
        lastNameTamil: user.lastNameTamil,
        phoneNumber01: user.phoneNumber01,
        phoneNumber02: user.phoneNumber02,
        image: user.image,
        nic: user.nic,
        email: user.email,
        address: {
          houseNumber: user.houseNumber,
          streetName: user.streetName,
          city: user.city,
          district: user.district,
          province: user.province,
          country: user.country,
        },
        languages: user.languages,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
      const userId = req.user.id;

      const user = await userAuthDao.getUserDetailsById(userId);
      
      res.status(200).json({
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          regcode: user.regcode,
          jobRole: user.jobRole,
          nicNumber: user.nicNumber,
          address: user.address,
          phoneNumber: user.phoneNumber,
          empid: user.empid,
      });
  } catch (error) {
      console.error('Error in getUserDetails controller:', error);
      res.status(500).json({ message: error.message });
  }
};

exports.updatePhoneNumber = async (req, res) => {
  const userId = req.user.id; // Assuming req.user is set by your authentication middleware
  const { phoneNumber } = req.body;

  // Input validation
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length !== 11) {
      return res.status(400).json({ message: 'Invalid phone number. It must be 11 characters long.' });
  }

  // Add the + prefix to the phone number
  const formattedPhoneNumber = `+${phoneNumber}`;

  try {
      const results = await userAuthDao.updatePhoneNumberById(userId, formattedPhoneNumber);

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
      console.error('Error updating phone number:', error);
      res.status(500).json({ message: 'An error occurred while updating the phone number' });
  }
};

exports.getOfficerQRCode = async (req, res) => {
  const officerId = req.user.id;

  try {
    const results = await userAuthDao.getQRCodeByOfficerId(officerId);

    if (results.length === 0) {
        return res.status(404).json({ error: 'Officer not found' });
    }

    const { QRcode } = results[0];
    if (!QRcode) {
        return res.status(404).json({ error: 'QR code not available for this officer' });
    }

    // Convert QRcode binary data to base64
    const qrCodeBase64 = QRcode.toString('base64');

    res.status(200).json({
        message: 'Officer QR code retrieved successfully',
        QRcode: `data:image/png;base64,${qrCodeBase64}`, // Return as a base64-encoded image
    });
} catch (error) {
    console.error('Error fetching officer QR code:', error.message);
    res.status(500).json({ error: 'Failed to fetch officer QR code' });
}
};