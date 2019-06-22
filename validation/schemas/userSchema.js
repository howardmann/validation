let Joi = require('joi')

let createUserSchema = Joi.object().keys({
  email: Joi.string().email(),
  name: Joi.string(),
  password: Joi.string().min(7).alphanum()
})

module.exports = {
  createUserSchema
}

