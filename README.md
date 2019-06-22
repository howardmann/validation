# Express.js Error Handling

How to validate requests and handle errors in Express.js using Joi validation library. (Click here for a link to the repo)[https://github.com/howardmann/validation].

1. [Gentle introduction to Joi validation](#1.-Gentle-introduction-to-Joi-validation)
2. [General route error handling in Express.js](#2.-General-route-error-handling-in-Express.js)
3. [Three examples of handling request validations](#3.Three-examples-of-handling-request-validations)

## 1. Gentle introduction to Joi validation
Joi is an expressive validator library for JavaScript objects. It helps ensure inputs are checked before progressing (e.g. to a DB).

You first create a schema and then validate the payload against the schema. If invalid it will throw the relevant error message.
```javascript
let Joi = require('joi')

// Create schema
let createProductSchema = Joi.object().keys({
  description: Joi.string().required(),
  price: Joi.number().min(0.01).required()
})

let payload = {
  description: 'red book',
  price: 0.0001
}

Joi.validate(payload, createProductSchema)
  .then(validated => {
    console.log(validated);
  })
  .catch(err => {
    console.log(err);
    // [ { message: '"price" must be a number',
    // path: [ 'price' ],
    // type: 'number.base',
    // context: { value: null, key: 'price', label: 'price' } } ]
  })
```

We can DRY our code and refactor the schemas and validators into separate files
```javascript
// validation/schemas/productSchema.js
let Joi = require('joi')

// We can reuse schemas
let priceSchema = Joi.number().min(0.01)

// Schema for creating a product, all fields are required
let createProductSchema = Joi.object().keys({
  description: Joi.string().required(),
  price: priceSchema.required()
})

// Schema for editing a product, all fields are optional and we can have a custom error message
let editProductSchema = Joi.object().keys({
  description: Joi.string(),
  price: priceSchema.error(() => 'when editing price must be number greater than 0.01')
})

module.exports = { 
  createProductSchema, 
  editProductSchema
}
```

```javascript
//validation/createValidator.js
let Joi = require('joi')

// DRY our code with higher order function
const createValidator = (schema) => 
  (payload) => {
    return Joi.validate(payload, schema, {
      // shows all error messages instead of first error message
      abortEarly: false
    })
  }

module.exports = createValidator
```

## 2. General route error handling in Express.js
We need to create two error handlers in our express application to handle all server errors and 404 route errors.

This way if we throw an error in any of our other routes the error handler will catch and display the relevant error message.

```javascript
let express = require('express')
let bodyParser = require('body-parser') // handle req.body
let app = express()
app.use(bodyParser.json())

// Require routes
app.use(require('./routes'))

// Custom server error handler
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.message)
    if (!err.statusCode) {err.statusCode = 500} // Set 500 server code error if statuscode not set
    return res.status(err.statusCode).send({
      statusCode: err.statusCode,
      message: err.message
    })
  }

  next()
})

// Custom 404 route not found handler
app.use((req, res) => {
  res.status(404).send('404 not found')
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})
```

## 3. Three examples of handling request validations
We can validate incoming Express payload requests using Joi in 3 ways:
1. We handle the payload within the route and catch error if its invalid
2. Create a custom middleware ([see next section](###Generic-Middleware)) to handle the validation and throw error if invalid
3. Use a library named `celebrate` which does same as option 2 but with more features

```javascript
let express = require('express');
let router = express.Router();


// Validation
let createValidator = require('../validation/createValidator')
let { createProductSchema } = require('../validation/schemas/productSchema')
let validate = require('../validation/validateMiddleware')
let {celebrate} = require('celebrate')


// 1. Validation using Joi within route
let validateProductCreate = createValidator(createProductSchema)

router.post('/products', (req, res, next) => {
  validateProductCreate(req.body)
    .then(validatedProduct => {
      res.send({status: 'success', validatedProduct})
    })
    .catch(next)
})

// 2. Validation using Joi custom middleware
router.post('/products2', validate(createProductSchema), (req, res, next) => {
  let payload = req.body
  res.send({status: 'success', payload})
})

// 3. Validation using celebrate middleware library
router.post('/products3', celebrate({body: createProductSchema}), (req, res, next) => {
  let payload = req.body
  res.send({status: 'success', payload})
})

module.exports = router;
```
### Generic Middleware
For option 2 we can create a generic middleware to handle validations.
```javascript
// validation/validateMiddleware
let createValidator = require('./createValidator')

let validateMiddleware = (schema) =>
  (req, res, next) => {
    let payload = req.body
    let validate = createValidator(schema)

    // proceed next if validated otherwise catch error and pass onto express error handler
    validate(payload)
      .then(validated => {
        req.body = validated
        next()
      })
      .catch(next)
  }

module.exports = validateMiddleware
```

For option 3 we must also add the celebrate error handler in our server file above our custom error handlers. This gives us more verbose error handling messaging.
```javascript
//server.js
let {errors} = require('celebrate') // handle celebrate joi errors

let app = express()

// Require routes
app.use(require('./routes'))

// Celebrate library error handler
app.use(errors())

// Custom server error handler
app.use((err, req, res, next) => {
})

// Custom 404 route not found handler
app.use((req, res) => {
})

const PORT = 3000
app.listen(PORT, () => {
})
```