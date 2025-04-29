const Joi = require('joi');

// Validation schema for user details
exports.userSchema = Joi.object({
  firstName:Joi.string().required(),
  
  lastName:Joi.string().required(),
  
  NICnumber:Joi.string().required(),
  
  phoneNumber:Joi.number().required(),
  
  district:Joi.string().required(),
  
  PreferdLanguage: Joi.string().required(),
  
  // Bank details
  accNumber:Joi.string().required(),
  
  accHolderName:Joi.string().required(),
  
  bankName:Joi.string().required(),
  
  branchName: Joi.string().required()
});


exports.bankDetailsSchema = Joi.object({
  accNumber:Joi.string().required(),
  
  accHolderName:Joi.string().required(),
  
  bankName:Joi.string().required(),
  
  branchName: Joi.string().required(),
  
  userId: Joi.number().required(),
  
});