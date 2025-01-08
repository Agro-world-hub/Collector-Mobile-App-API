const collectionofficerDao =require('../dao/manager-dao')
const QRCode = require('qrcode');

exports.createCollectionOfficer = async (req, res) => {
  try {
    const { id: irmId } = req.user;

    const irmDetails = await collectionofficerDao.getIrmDetails(irmId);
    if (!irmDetails) {
      return res.status(404).json({ error: "IRM details not found" });
    }

    const { companyId, centerId } = irmDetails;

    const officerData = {
      ...req.body,
      empId: req.body.userId, // Map userId to empId
      phoneNumber01: req.body.phoneNumber1, // Map phoneNumber1 to phoneNumber01
      phoneNumber02: req.body.phoneNumber2 || null, // Map phoneNumber2 to phoneNumber02
      nic: req.body.nicNumber,
      accHolderName:req.body.accountHolderName,
      accNumber:req.body.accountNumber,
    };

    console.log("Mapped Officer Data:", officerData);

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
