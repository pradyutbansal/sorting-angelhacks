const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
const bodyParser = require('body-parser');


const User = require('../models/user');

/***************************** ROUTES *****************************/

router.get('/connect', (req, res) => {
  auth.generateAuthUrl(req.query.auth_id).then(url => res.redirect(url));
});

router.get('/connect/callback', (req, res) => {
  const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id)
    .then(() => res.send('Successfully Authenticated with Google! =D'))
    .catch(() => res.send('Authentication with Google Failed! =('));
});


module.exports = router;