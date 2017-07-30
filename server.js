const express = require('express');
const bodyParser = require('body-parser');
const vision = require('node-cloud-vision-api')
const logger = require('morgan');
const axios = require('axios');

const port = process.env.PORT || 3000;
const googleAPIKey = 'AIzaSyD3uyjc1W7J47G3o24Ez5fyBrNL4en0fwo';
const app = express();


app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.post('/andre', function(req, res) {
  labelPhoto(req.body.image)
  .then(type => res.json({type}))
  .catch(err => {
    console.log(err);
    res.send({type: 'error', error: err})
  });
})

/* ********** error handlers ********** */

// app.use('/', routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});


app.listen(port, function() {
  console.log('Express started. Listening on port %s', port);
});



/* Helper function */
function labelPhoto(base64){
  return new Promise((resolve, reject) =>{
    vision.init({auth: googleAPIKey})
    // construct parameters
    const req = new vision.Request({
      image: new vision.Image({base64}),
      //image: new vision.Image({url: fileUri}),
      features: [
        new vision.Feature('LABEL_DETECTION', 10),
      ]
    })

    // send single request

      vision.annotate(req)
      .then(res => {
        var itemMatches = (res.responses[0].labelAnnotations)
        var destination = sortPhoto(itemMatches)
        axios.post('https://api.particle.io/v1/devices/200025001847343438323536/led?access_token=83488e0ae4449156570ffe3b9c0774c826ea6166',
          {value: destination});
          resolve(destination);
      })
      .catch(e => {
        console.log('Error: ', e)
        reject(e);
      })
  })
}

function sortPhoto(itemLabelsArray){
  console.log('ARRAY: ', itemLabelsArray);
  const compost = ['fruit', 'produce', 'food', 'vegetable', 'local food', 'vegetarian food']
  const recycle = ['aluminum can', 'cola', 'product', 'laundry supply', 'household supply', 'water bottle', 'plastic bottle', 'bottle', 'bottled water', 'glass bottle']
  let destination = 'trash'
  itemLabelsArray.forEach((label) => {
    if (compost.indexOf(label.description) !== -1 && label.score >= 0.5) {
      destination = 'compost'
    } else if (recycle.indexOf(label.description) !== -1 && label.score >= 0.5) {
      destination = 'recycle'
    }
  })
  console.log('DESTINATION: ', destination)
  return destination;

}
