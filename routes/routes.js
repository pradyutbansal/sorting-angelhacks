var express = require('express');
var router = express.Router();
var models = require('../models');
var User = models.User;

const path = require('path');
const axios = require('axios');

var base64 = require('node-base64-image');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;


var User = models.User;
var Session = require('express-session');


function getoAuthClient(){
	return new OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		"http://localhost:3000/connect/callback"
	)
}


// generate a url that asks permissions for Google+ and Google Calendar scopes
function getAuthURL(){
  var oauth2Client = getoAuthClient()
  var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/cloud-platform'
  ];

  var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
    // state: { foo: 'bar' }
    client_id: '930642252734-jiiotbobo4cbtd92179rnd4e4teea5fv.apps.googleusercontent.com'
  });
  return url

}



//////////////////////////////// PUBLIC ROUTES ////////////////////////////////
// Users who are not logged in can see these routes

router.use(Session({
    secret: 'tZ0NoQXoDd5lHuw3KVvKipAN',
    resave: true,
    saveUninitialized: true
}));


router.get("/", function (req, res) {
    var url = getAuthURL();
    res.send(`<a href =${url}> Hi </a>`)
});

router.get("/connect/callback", function (req, res) {
    var oauth2Client = getoAuthClient()
    var session = req.session;
    var code = req.query.code; // the query param code
    console.log("oauth2Client, ", oauth2Client)
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
 	  console.log("tokens ", tokens)
      if(!err) {
        oauth2Client.setCredentials(tokens);
        //saving the token to current session
        session["tokens"]=tokens;
        console.log("login successful!")
        simpleLabel(oauth2Client)
        res.redirect('/hi')


      }
      else{
      	console.log(err)
        res.send(`
            <h3>Login failed!!</h3>;
        `);
      }
    });
});

router.post('/andre', function(req, res) {
  console.log(req.body);

  simpleLabel(req.body.image);
  res.send('hi bb');
})

function simpleLabel(base64){
	var vision = require('node-cloud-vision-api')
	vision.init({auth: 'AIzaSyD3uyjc1W7J47G3o24Ez5fyBrNL4en0fwo'})
	//console.log(" VISION IMAGE ", vision.images.annotate)
  // var fileName = __dirname + "/sorter/images/less_water.JPG"
  var fileName = path.join(__dirname, '../images/less_water.JPG');
	// construct parameters
	const req = new vision.Request({
    // image: new vision.Image(fileName),
	  image: new vision.Image({base64}),
	  features: [
	    new vision.Feature('LABEL_DETECTION', 10),
	  ]
	})

	// send single request
	vision.annotate(req).then((res) => {
	  // handling response
	  let destination = 'trash'
    //console.log("RESPONSE: ", res.responses)
    var itemMatches = (res.responses[0].labelAnnotations)
    const compost = ['product', 'fruit', 'produce', 'food', 'vegetable', 'local food', 'vegetarian food']
    const recycle = ['product', 'laundry supply', 'household supply', 'water bottle', 'plastic bottle', 'bottle', 'bottled water', 'glass bottle']
    console.log("res.responses: ", res.responses[0].labelAnnotations) //array
    res.responses[0].labelAnnotations.forEach((item) => {

      if(compost.indexOf(item.description) !== -1 && item.score >= 0.85){
        destination = 'compost'
      }
      else if(recycle.indexOf(item.description) !== -1 && item.score >= 0.85){
        destination = 'recycle'
      }
    })
    console.log("destination: ", destination)

    axios.post('https://api.particle.io/v1/devices/200025001847343438323536/led?access_token=83488e0ae4449156570ffe3b9c0774c826ea6166',
  {
    value: destination
  }).then(console.log).catch(console.log);
    return destination;

	}, (e) => {
	  console.log('Error: ', e)
	})
}


router.get("/hi", function(req, res){
  res.send("HI")

})




///////////////////////////// END OF PUBLIC ROUTES /////////////////////////////

router.use(function(req, res, next){
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
});

//////////////////////////////// PRIVATE ROUTES ////////////////////////////////
// Only logged in users can see these routes

router.get('/protected', function(req, res, next) {
  res.render('protectedRoute', {
    username: req.user.username,
  });
});

///////////////////////////// END OF PRIVATE ROUTES /////////////////////////////

module.exports = router;
