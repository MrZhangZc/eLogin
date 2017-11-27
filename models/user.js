var mongoose = require('mongoose')
var UserSchema = require('../schaemas/user')
var User = mongoose.model('User', UserSchema)

module.exports = User