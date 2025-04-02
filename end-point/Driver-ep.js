const driverDao = require('../dao/Driver-dao');
const uploadFileToS3  = require('../Middlewares/s3upload'); // Adjust path as needed

exports.createDriverWithVehicle = async (req, res) => {
  try {
    const { id: irmId } = req.user;

    // Check if driver already exists
    const driverExists = await driverDao.checkDriverExists(
      req.body.nic, 
      req.body.email
    );

    if (driverExists) {
      return res.status(400).json({ 
        error: "Driver with this NIC or email already exists" 
      });
    }

    // Helper function to convert base64 to buffer
    const convertBase64ToBuffer = (base64String) => {
      try {
        // Remove data:image/jpeg;base64, or similar prefix if present
        const base64Data = base64String.includes(';base64,')
          ? base64String.split(';base64,').pop()
          : base64String;
       
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error("Error converting base64 to buffer:", error);
        throw new Error("Invalid base64 format");
      }
    };

    // Helper function to generate a unique filename
    const generateUniqueFileName = (originalName) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
     
      // Extract extension from original filename or use default
      let fileExt = 'jpg';
      if (originalName && originalName.includes('.')) {
        fileExt = originalName.split('.').pop();
      }
     
      return `${timestamp}-${randomStr}.${fileExt}`;
    };

    // Handle image uploads (example for one image type, repeat for others)
    const uploadImage = async (base64Image, folderPath) => {
      if (!base64Image) return null;

      try {
        const fileBuffer = convertBase64ToBuffer(base64Image);
        const fileName = generateUniqueFileName('image.jpg');
        
        return await uploadFileToS3(fileBuffer, fileName, folderPath);
      } catch (uploadError) {
        console.error(`Error uploading image to S3:`, uploadError);
        throw new Error(`Invalid image format or upload failed`);
      }
    };

    // Upload images
    const [
      profileImageUrl,
      licFrontImgUrl,
      licBackImgUrl,
      insFrontImgUrl,
      insBackImgUrl,
      vehFrontImgUrl,
      vehBackImgUrl,
      vehSideImgAUrl,
      vehSideImgBUrl
    ] = await Promise.all([
      uploadImage(req.body.profileImage, "driver-profiles"),
      uploadImage(req.body.licFrontImg, "driver-license-front"),
      uploadImage(req.body.licBackImg, "driver-license-back"),
      uploadImage(req.body.insFrontImg, "insurance-front"),
      uploadImage(req.body.insBackImg, "insurance-back"),
      uploadImage(req.body.vehFrontImg, "vehicle-front"),
      uploadImage(req.body.vehBackImg, "vehicle-back"),
      uploadImage(req.body.vehSideImgA, "vehicle-side-a"),
      uploadImage(req.body.vehSideImgB, "vehicle-side-b")
    ]);

    // Prepare driver data
    const driverData = {
      // Personal Details
      firstNameEnglish: req.body.firstNameEnglish,
      firstNameSinhala: req.body.firstNameSinhala,
      firstNameTamil: req.body.firstNameTamil,
      lastNameEnglish: req.body.lastNameEnglish,
      lastNameSinhala: req.body.lastNameSinhala,
      lastNameTamil: req.body.lastNameTamil,
      
      // Contact Details
      nic: req.body.nic,
      email: req.body.email,
      phoneCode01: req.body.phoneCode01,
      phoneNumber01: req.body.phoneNumber01,
      phoneCode02: req.body.phoneCode02,
      phoneNumber02: req.body.phoneNumber02,
      
      // Employment Details
      empId: req.body.empId,
      empType: req.body.empType,
      
      // Address Details
      houseNumber: req.body.houseNumber,
      streetName: req.body.streetName,
      city: req.body.city,
      district: req.body.district,
      province: req.body.province,
      country: req.body.country,
      
      // Additional Details
      languages: req.body.languages,
      profileImageUrl,
      
      // Bank Details
      accHolderName: req.body.accHolderName,
      accNumber: req.body.accNumber,
      bankName: req.body.bankName,
      branchName: req.body.branchName,
      
      // Vehicle Details
      licNo: req.body.licNo,
      insNo: req.body.insNo,
      insExpDate: req.body.insExpDate,
      vType: req.body.vType,
      vCapacity: req.body.vCapacity,
      vRegNo: req.body.vRegNo,
      
      // Vehicle Image URLs
      licFrontImg: licFrontImgUrl,
      licBackImg: licBackImgUrl,
      insFrontImg: insFrontImgUrl,
      insBackImg: insBackImgUrl,
      vehFrontImg: vehFrontImgUrl,
      vehBackImg: vehBackImgUrl,
      vehSideImgA: vehSideImgAUrl,
      vehSideImgB: vehSideImgBUrl
    };

    // Get center and company ID from IRM (assumed to be in req.user or from a separate method)
    const { centerId, companyId } = req.user;
    
    console.log('drivrerData:', driverData);

    // Create driver with vehicle
    const result = await driverDao.createDriverWithVehicle(
      driverData, 
      centerId, 
      companyId, 
      irmId
    );
    

    // Respond with success
    return res.status(201).json({
      message: "Driver and vehicle registered successfully",
      driverId: result.driverId,
      vehicleId: result.vehicleId,
      status: true
    });
  } catch (error) {
    console.error("Error creating driver with vehicle:", error);
    return res.status(500).json({
      error: "An error occurred while creating the driver and vehicle",
      details: error.message
    });
  }
};
