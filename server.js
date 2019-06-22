let express = require('express')
let bodyParser = require('body-parser') // handle req.body
let {errors} = require('celebrate') // handle celebrate joi errors

let app = express()
app.use(bodyParser.json())

// Require routes
app.use(require('./routes'))

// Celerate library error handler
app.use(errors())

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