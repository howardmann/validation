let signup = module.exports = {}

let createValidator = require('../validation/createValidator')
let {createUserSchema} = require('../validation/schemas/userSchema')
let validateUser = createValidator(createUserSchema)

signup.show = (req, res, next) => {
  res.render('signup')
}


signup.create = (req, res, next) => {
  let payload = req.body
  
  validateUser(payload)
    .then(data => {
      console.log(data)
      req.flash('messageSuccess', 'Success valid input')
      res.redirect('/signup')
    })
    .catch(err => {
      let errorMessages = err.details.map(el => el.message)
      console.log(errorMessages)
      req.flash('validationFailure', errorMessages)
      res.redirect('/signup')
    })
}