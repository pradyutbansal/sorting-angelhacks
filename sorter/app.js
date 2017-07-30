var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;

// mongoose.connect(connect);

var models = require('./models');

var routes = require('./routes/routes');
var auth = require('./routes/auth');
var app = express();






app.get('/connect', function(req,res){
  var userId = req.query.user
  if(! userId){
   res.status(400).send('Missing user id');
 } else{
  User.findById(userId)
  .then(function(user){
   if(!user){
     res.status(404).send('Cannot find user');
   } else{
       //connect to google
       var googleAuth = getGoogleAuth();
       var url = googleAuth.generateAuthUrl({
         access_type: 'offline',
         prompt: 'consent',
         scope: GOOGLE_SCOPES,
         state: userId
       })
       res.redirect(url)
     }
   });
  }
})



app.use('/', routes);
//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// var google = require('googleapis');
// var OAuth2 = google.auth.OAuth2;

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Express started. Listening on port %s', port);

module.exports = app;
