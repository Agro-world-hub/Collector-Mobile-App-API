const jwt = require("jsonwebtoken");
const userAuthDao = require("../dao/userAuth-dao");
const bcrypt = require("bcrypt");
const { loginSchema } = require('../Validations/Auth-validations');


exports.loginUser = async (req, res) => {
  try {
    // Step 1: Validate the request body using Joi
    console.log("Request Body:", req.body);
    const { error } = loginSchema.validate(req.body);
    console.log("Validation Error:", error);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    const { empId, password } = req.body;

    console.log("Employee ID:", empId);
    console.log("Password Provided:", password);

    let collectionOfficerResult;
    try {
      collectionOfficerResult = await userAuthDao.getOfficerByEmpId(empId);
    } catch (error) {
      console.error("Error fetching Employee ID:", error.message);
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }

    const collectionOfficerId = collectionOfficerResult[0]?.id;
    const jobRole = collectionOfficerResult[0]?.jobRole;

    if (!collectionOfficerId) {
      return res.status(404).json({
        status: "error",
        message: "Invalid Employee ID",
      });
    }

    const users = await userAuthDao.getOfficerPasswordById(collectionOfficerId);

    if (!users || users.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const officer = users[0];
    console.log("Hashed Password from Database:", officer.password);

    // Check if the officer's status is "Approved"
    if (officer.status !== "Approved") {
      return res.status(403).json({
        status: "error",
        message: `Access denied. Your account status is "${officer.status}". Please contact the admin for assistance.`,
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, officer.password);
    console.log("Password Match Result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // If password is valid, generate a JWT token
    const payload = {
      id: officer.id,
      email: officer.email,
      firstNameEnglish: officer.firstNameEnglish,
      lastNameEnglish: officer.lastNameEnglish,
      phoneNumber01: officer.phoneNumber01,
      centerId: officer.centerId,
      companyName: officer.companyName,
      companyId: officer.companyId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "T1", {
      expiresIn: "10h",
    });

    const passwordUpdateRequired = !officer.passwordUpdated;

    const response = {
      status: "success",
      message: passwordUpdateRequired
        ? "Login successful, but password update is required"
        : "Login successful",
      officer: payload,
      passwordUpdateRequired,
      token,
      userId: officer.id,
      jobRole: jobRole,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Login Error:", err);

    if (err.isJoi) {
      return res.status(400).json({
        status: "error",
        message: err.details[0].message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred during login.",
    });
  }
};


exports.updatePassword = async (req, res) => {
  const { empId, currentPassword, newPassword } = req.body;
  console.log("Attempting to update password for empid:", empId);
  if (!empId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const collectionOfficerIdResult = await userAuthDao.getOfficerByEmpId(
    empId
  );
  const collectionOfficerId = collectionOfficerIdResult[0]?.id;
  console.log("Collection Officer ID:", collectionOfficerId);

  const users = await userAuthDao.getOfficerPasswordById(
    collectionOfficerId
  );
  const officer = users[0];
    console.log("Stored Hashed Password (from DB):", officer.password);

    const isPasswordValid = await bcrypt.compare(currentPassword, officer.password);
    console.log("Password Match Result:", isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("Plain Password:", hashedPassword );
  try {
    try {
      await userAuthDao.updatePasswordInDatabase(
        collectionOfficerId,
        hashedPassword
      );

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      if (error === "Database error") {
        return res.status(500).json({
          message: "Database error occurred while updating the password",
        });
      } else if (error === "Current password is incorrect") {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      } else {
        return res
          .status(500)
          .json({ message: "An error occurred while updating the password" });
      }
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the password" });
  }
};

// exports.getProfile = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const user = await userAuthDao.getProfileById(userId);

//     res.status(200).json({
//       status: "success",
//       user: {
//         firstNameEnglish: user.firstNameEnglish,
//         firstNameSinhala: user.firstNameSinhala,
//         firstNameTamil: user.firstNameTamil,
//         lastNameEnglish: user.lastNameEnglish,
//         lastNameSinhala: user.lastNameSinhala,
//         lastNameTamil: user.lastNameTamil,
//         phoneNumber01: user.phoneNumber01,
//         phoneNumber02: user.phoneNumber02,
//         image: user.image,
//         nic: user.nic,
//         email: user.email,
//         address: {
//           houseNumber: user.houseNumber,
//           streetName: user.streetName,
//           city: user.city,
//           district: user.district,
//           province: user.province,
//           country: user.country,
//         },
//         languages: user.languages,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// };

exports.getProfile = async (req, res) => {
  try {
    const officerId = req.user.id; // Assuming req.user.id is set after authentication
    console.log("Fetching details for Officer ID:", officerId);

    if (!officerId) {
      return res.status(400).json({ status: "error", message: "Officer ID is required" });
    }

    const officerDetails = await userAuthDao.getOfficerDetailsById(officerId);

    res.status(200).json({
      status: "success",
      data: officerDetails,
    });
  } catch (error) {
    console.error("Error fetching officer details:", error.message);

    if (error.message === "Officer not found") {
      return res.status(404).json({ status: "error", message: "Officer not found" });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching officer details",
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
    console.error("Error in getUserDetails controller:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePhoneNumber = async (req, res) => {
  const userId = req.user.id; // Assuming req.user is set by your authentication middleware
  const { phoneNumber } = req.body;

  // Input validation
  if (
    !phoneNumber ||
    typeof phoneNumber !== "string" ||
    phoneNumber.length !== 11
  ) {
    return res.status(400).json({
      message: "Invalid phone number. It must be 11 characters long.",
    });
  }

  // Add the + prefix to the phone number
  const formattedPhoneNumber = `+${phoneNumber}`;

  try {
    const results = await userAuthDao.updatePhoneNumberById(
      userId,
      formattedPhoneNumber
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Phone number updated successfully" });
  } catch (error) {
    console.error("Error updating phone number:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the phone number" });
  }
};

exports.getOfficerQRCode = async (req, res) => {
  const officerId = req.user.id;

  try {
    const results = await userAuthDao.getQRCodeByOfficerId(officerId);

    if (results.length === 0) {
      return res.status(404).json({ error: "Officer not found" });
    }

    const { QRcode } = results[0];
    if (!QRcode) {
      return res
        .status(404)
        .json({ error: "QR code not available for this officer" });
    }

    // Convert QRcode binary data to base64
    const qrCodeBase64 = QRcode.toString("base64");

    res.status(200).json({
      message: "Officer QR code retrieved successfully",
      QRcode: `data:image/png;base64,${qrCodeBase64}`, // Return as a base64-encoded image
    });
  } catch (error) {
    console.error("Error fetching officer QR code:", error.message);
    res.status(500).json({ error: "Failed to fetch officer QR code" });
  }
};
