var mongoose = require('mongoose');

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
})



Image = mongoose.model('Image', imageSchema);

module.exports = {
    Image: Image,
    User: userSchema
};
