const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.object({
      url: Joi.string().uri().required(),
      filename: Joi.string().required()
    }).required(),
    price: Joi.number().required(),
    country: Joi.string().required(),
    location: Joi.string().required()
  }).required()
});
