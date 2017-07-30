var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
   id: String,
   authenticated: Boolean,
   google: Object
})

module.exports = {
    User: userSchema
};