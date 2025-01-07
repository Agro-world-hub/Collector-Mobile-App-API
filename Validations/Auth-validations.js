const Joi = require('joi');


const loginSchema = Joi.object({
  empId: Joi.string().required().label("Employee ID"), // Expecting empId as a string
  password: Joi.string().required().label("Password"), // Password is also required
});

// Exporting the schema for use in the route handler
module.exports = {
  loginSchema,
};
