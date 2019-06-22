let Joi = require('joi')

let priceSchema = Joi.number().min(0.01)

let createProductSchema = Joi.object().keys({
  description: Joi.string().required(),
  price: priceSchema.required()
})

let editProductSchema = Joi.object().keys({
  description: Joi.string(),
  price: priceSchema.error(() => 'when editing price must be number greater than 0.01')
})

module.exports = { 
  createProductSchema, 
  editProductSchema
}
