var mongoose = require('mongoose');

mongoose.connect('mongodb://testuser:test@ds039421.mongolab.com:39421/flight-test')

module.exports = mongoose.connection;