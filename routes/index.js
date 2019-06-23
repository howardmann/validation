let express = require('express');
let router = express.Router();


// Validation
let createValidator = require('../validation/createValidator')
let { createProductSchema } = require('../validation/schemas/productSchema')
let validate = require('../validation/middlewares/validateMiddleware')
let { createUserSchema } = require('../validation/schemas/userSchema')
let validateForm = require('../validation/middlewares/validateForm')
let {celebrate} = require('celebrate')


// Validation using Joi within route
let validateProductCreate = createValidator(createProductSchema)

router.post('/products', (req, res, next) => {
  validateProductCreate(req.body)
    .then(validatedProduct => {
      res.send({status: 'success', validatedProduct})
    })
    .catch(next)
})

// Validation using Joi custom middleware
router.post('/products2', validate(createProductSchema), (req, res, next) => {
  let payload = req.body
  res.send({status: 'success', payload})
})

// Validation using celebrate middleware library
router.post('/products3', celebrate({body: createProductSchema}), (req, res, next) => {
  let payload = req.body
  res.send({status: 'success', payload})
})


let signUp = require('./signUp')
router.get('/signup', signUp.show)
// router.post('/signup', signUp.create)
router.post('/signup', validateForm(createUserSchema, '/signup'), (req, res, next) => {
  let payload = req.body
  console.log(payload);
  req.flash('messageSuccess', 'woohoo')
  res.redirect('/signup')
})

module.exports = router;