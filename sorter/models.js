var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  url: String,
  response:Object
});



Image = mongoose.model('Image', imageSchema);

module.exports = {
    Image: Image
};
