var mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
// const auth = require('../services/authentication');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var passport = require('passport');
// var LocalStrategy = require('passport-local');
const connect = process.env.MONGODB_URI;

const axios = require('axios');

const app = express();
var vision = require('node-cloud-vision-api')


/***************************** ROUTES *****************************/

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.get('/andre', function(req, res) {
  labelPhoto();
  res.send('hi bb');
})

/* ********** error handlers ********** */

// app.use('/', routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;

/* Helper function */
function labelPhoto(){
  return new Promise((resolve, reject) =>{
    vision.init({auth: 'AIzaSyD3uyjc1W7J47G3o24Ez5fyBrNL4en0fwo'})
    var fileName = path.join(__dirname, '../sorting-angelhacks/images/less_water.JPG');
    console.log("fileName: ", fileName)
    // var fileUri = '#'

    // construct parameters
    const req = new vision.Request({
      image: new vision.Image(fileName),
      //image: new vision.Image({url: fileUri}),
      features: [
        new vision.Feature('LABEL_DETECTION', 10),
      ]
    })

    // send single request
    resolve (
      vision.annotate(req).then((res) => {
      // handling response
      //console.log("RESPONSE: ", res.responses)
      var itemMatches = (res.responses[0].labelAnnotations)
      //console.log("res.responses: ", res.responses[0].labelAnnotations) //array
      var destination = sortPhoto(itemMatches)


      axios.post('https://api.particle.io/v1/devices/200025001847343438323536/led?access_token=83488e0ae4449156570ffe3b9c0774c826ea6166',
      {
      value: destination
      }).then().catch(console.log);
      return destination;

      }, (e) => {
      console.log('Error: ', e)
      })
    )


  })
	
}

function sortPhoto(itemLabelsArray){
  const compost = ['product', 'fruit', 'produce', 'food', 'vegetable', 'local food', 'vegetarian food']
  const recycle = ['product', 'laundry supply', 'household supply', 'water bottle', 'plastic bottle', 'bottle', 'bottled water', 'glass bottle']
  let destination = 'trash'
  itemLabelsArray.forEach((label) => {
    if(compost.indexOf(label.description) !== -1 && label.score >= 0.5){
      destination = 'compost'
    }
    else if(recycle.indexOf(label.description) !== -1 && label.score >= 0.5){

      destination = 'recycle'
    }
  })
  console.log(destination)
  return destination;

}



/* *********** SCHEMAS ********** */
var imageSchema = mongoose.Schema({
  url: String,
  response:Object
});

var userSchema = new mongoose.Schema({
   slackId: String,
   authenticated: Boolean,
   google: Object,
   email: String,
   pending: String,
   slackIds: Array
});

Image = mongoose.model('Image', imageSchema);
User = mongoose.model('User', userSchema);


/*
body {
  min-height: 75rem;
  padding-top: 6.5rem;
  font: 14px "Open Sans", Helvetica, Arial, sans-serif;
}
*/
