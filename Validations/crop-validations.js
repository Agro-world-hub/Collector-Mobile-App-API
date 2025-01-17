const Joi = require('joi');


const cropDetailsSchema = Joi.object({
  crops: Joi.array().items(
    Joi.object({
      varietyId: Joi.number().required(), // Allow varietyId as a number and make it required
      gradeAprice: Joi.number().optional(),
      gradeAquan: Joi.number().optional(),
      gradeBprice: Joi.number().optional(),
      gradeBquan: Joi.number().optional(),
      gradeCprice: Joi.number().optional(),
      gradeCquan: Joi.number().optional(),
      image: Joi.string().optional().allow(null), // Allow image to be a string or null
    }).required()
  ).required(),
  farmerId: Joi.number().required()  // Make farmerId required as well
});

module.exports = {
  cropDetailsSchema,
};
