const collectionofficerDao =require('../dao/manager-dao')
const jwt = require('jsonwebtoken');
exports.createCollectionOfficer = async (req, res) => {
  try {
    const { id: irmId } = req.user;

    // Get IRM details
    const irmDetails = await collectionofficerDao.getIrmDetails(irmId);
    if (!irmDetails) {
      return res.status(404).json({ error: "IRM details not found" });
    }

    const { companyId, centerId } = irmDetails;

    // Validate NIC
    console.log("NIC:", req.body.nicNumber);
    const nicExists = await collectionofficerDao.checkNICExist(req.body.nicNumber);
    if (nicExists) {
      return res.status(400).json({ error: "NIC already exists." });
    }

    // Validate Email
    console.log("Email:", req.body.email);
    const emailExists = await collectionofficerDao.checkEmailExist(req.body.email);
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Map request body fields
    const officerData = {
      ...req.body,
      empId: req.body.userId, // Map userId to empId
      phoneNumber01: req.body.phoneNumber1, // Map phoneNumber1 to phoneNumber01
      phoneNumber02: req.body.phoneNumber2 || null, // Map phoneNumber2 to phoneNumber02
      nic: req.body.nicNumber,
      accHolderName: req.body.accountHolderName,
      accNumber: req.body.accountNumber,
      phoneCode01: req.body.phoneCode1,
      phoneCode02: req.body.phoneCode2 || null,
    };

    console.log("Mapped Officer Data:", officerData);

    // Create the collection officer
    const resultsPersonal = await collectionofficerDao.createCollectionOfficerPersonal(
      officerData,
      centerId,
      companyId,
      irmId
    );

    console.log("Collection Officer created successfully:", resultsPersonal);
    return res.status(201).json({
      message: "Collection Officer created successfully",
      id: resultsPersonal.insertId,
      status: true,
    });
  } catch (error) {
    console.error("Error creating collection officer:", error);
    return res.status(500).json({
      error: "An error occurred while creating the collection officer",
    });
  }
};



exports.getForCreateId = async (req, res) => {
  try {
    const { role } = req.params; 
    console.log("Role:", role);
    let rolePrefix
    if(role === 'Collection Officer'){
      rolePrefix = 'CCO'
    }

    const results = await collectionofficerDao.getForCreateId(rolePrefix);

    if (results.length === 0) {
      return res.json({ result: { empId: "00001" }, status: true });
    }

    res.status(200).json({ result: results[0], status: true });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
};


//transaction details
exports.getFarmerListByCollectionOfficerAndDate = async (req, res) => {
  const { collectionOfficerId, date } = req.query;

  if (!collectionOfficerId || !date) {
      return res.status(400).json({
          error: 'Both collectionOfficerId and date are required.',
      });
  }

  try {
      const farmers = await collectionofficerDao.getFarmerListByCollectionOfficerAndDate(
          collectionOfficerId,
          date
      );
      res.status(200).json(farmers);
  } catch (error) {
      console.error('Error fetching farmer list:', error);
      res.status(500).json({ error: 'An error occurred while fetching the farmer list' });
  }
};

exports.getClaimOfficer = async (req, res) => {

  const {empID, jobRole} = req.body;
  try {
    const results = await collectionofficerDao.getClaimOfficer(empID, jobRole);
    res.status(200).json({ result: results, status: true });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
}

exports.createClaimOfficer = async (req, res) => {
  const { officerId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const irmId = decoded.id;
  const centerId = decoded.centerId;

  try {
    const results = await collectionofficerDao.createClaimOfficer(officerId, irmId, centerId);
    res.status(200).json({ result: results, status: true });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
}

exports.disclaimOfficer = async (req, res) => {
  const { collectionOfficerId } = req.body;

  if (!collectionOfficerId) {
    return res.status(400).json({ status: 'error', message: 'Missing collectionOfficerId in request body.' });
  }

  try {
    const results = await collectionofficerDao.disclaimOfficer(collectionOfficerId);
    if (results.affectedRows > 0) {
      res.status(200).json({
        status: 'success',
        data: results,
        message: 'Officer disclaimed successfully.',
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Officer not found or already disclaimed.',
      });
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while disclaiming the officer.',
    });
  }
};
