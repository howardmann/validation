let createValidator = require('../createValidator.js')

let validateMiddleware = (schema) =>
  (req, res, next) => {
    let payload = req.body
    let validate = createValidator(schema)

    validate(payload)
      .then(validated => {
        req.body = validated
        next()
      })
      .catch(next)
  }

module.exports = validateMiddleware