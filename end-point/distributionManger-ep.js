const distributionofficerDao = require('../dao/distributionManager-dao')
const jwt = require('jsonwebtoken'); const Joi = require('joi');

const uploadFileToS3 = require('../Middlewares/s3upload');

exports.getProfile = async (req, res) => {
  try {
    const officerId = req.user.id; // Assuming req.user.id is set after authentication
    console.log("Fetching details for Officer ID:", officerId);

    if (!officerId) {
      return res.status(400).json({ status: "error", message: "Officer ID is required" });
    }

    const officerDetails = await distributionofficerDao.getOfficerDetailsById(officerId);

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