let Joi = require('joi')

const createValidator = (schema) => 
  (payload) => {
    return Joi.validate(payload, schema, {
      abortEarly: false
    })
  }

module.exports = createValidator