const Joi = require('joi');


const loginSchema = Joi.object({
  empid: Joi.string().required().min(5).max(50).messages({
    'string.base': 'Employee ID must be a string',
    'string.min': 'Employee ID must be at least 5 characters long',
    'string.max': 'Employee ID must be less than 50 characters',
    'any.required': 'Employee ID is required',
    // 'string.pattern.base': 'Employee ID must start with letters followed by numbers',
  }),
  password: Joi.string().required().min(6).max(128).messages({
    'string.base': 'Password must be a string',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must be less than 128 characters',
    'any.required': 'Password is required',
  }),
});

// Exporting the schema for use in the route handler
module.exports = {
  loginSchema,
};
