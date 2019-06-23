let createValidator = require('../createValidator.js')

module.exports = (schema, redirectPath) =>
  (req, res, next) => {
    let payload = req.body
    let validate = createValidator(schema)

    validate(payload)
      .then(validated => {
        req.body = validated
        next()
      })
      .catch(err => {
        let errorMessages = err.details.map(el => el.message)
        console.log(errorMessages)
        req.flash('validationFailure', errorMessages)
        res.redirect(redirectPath)
      })
  }

