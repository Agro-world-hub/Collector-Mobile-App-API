const Joi = require('joi');

// Create validation schema for driver with vehicle
exports.driverWithVehicleSchema = Joi.object({
  // Personal Details
  firstNameEnglish: Joi.string().required(),
  firstNameSinhala: Joi.string().required(),
  firstNameTamil: Joi.string().required(),
  lastNameEnglish: Joi.string().required(),
  lastNameSinhala: Joi.string().required(),
  lastNameTamil: Joi.string().required(),

  // Contact Details
  nic: Joi.string().required().max(13),
  email: Joi.string().required(),
  phoneCode01: Joi.string().required(),
  phoneNumber01: Joi.string().required(),
  phoneCode02: Joi.string(),
  phoneNumber02: Joi.string().optional(),

  // Employment Details
  empId: Joi.string().required(),
  empType: Joi.string().required(),
  jobRole: Joi.string(), // Added jobRole field

  // Address Details
  houseNumber: Joi.string().required(),
  streetName: Joi.string().required(),
  city: Joi.string().required(),
  district: Joi.string().required(),
  province: Joi.string().required(),
  country: Joi.string().required(),

  // Additional Details
  languages: Joi.string(), // Make this optional
  preferredLanguages: Joi.string(), // Added preferredLanguages field

  // Bank Details
  accHolderName: Joi.string().required(),
  accNumber: Joi.string().required(), // Changed from number to string to accommodate non-numeric characters
  bankName: Joi.string().required(),
  branchName: Joi.string().required(),

  // Vehicle Details
  licNo: Joi.string().required(),
  insNo: Joi.string().required(),
  insExpDate: Joi.date().required(),
  vType: Joi.string().required(),
  vCapacity: Joi.string().required(), // Changed from number to string
  vRegNo: Joi.string().required(),

  // Image fields
  profileImage: Joi.string().allow('', null),
  licFrontImg: Joi.string().allow('', null),
  licBackImg: Joi.string().allow('', null),
  insFrontImg: Joi.string().allow('', null),
  insBackImg: Joi.string().allow('', null),
  vehFrontImg: Joi.string().allow('', null),
  vehBackImg: Joi.string().allow('', null),
  vehSideImgA: Joi.string().allow('', null),
  vehSideImgB: Joi.string().allow('', null)
});