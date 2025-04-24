const Joi = require('joi');

// Validation schema for individual price item
exports.priceItemSchema = Joi.object({
  prices: Joi.array().items(
    Joi.object({
      varietyId: Joi.string().required(),
      grade: Joi.string().required(),
      requestPrice: Joi.string().required()
    })
  ).required()
});


