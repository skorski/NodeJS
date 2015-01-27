
/**
 * Module dependencies.
 */


var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override')


module.exports = function(flights) {
  var express = require('express');
  var routes = require('./routes')(flights);
  var path = require('path');
  var app = express();

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.favicon());
  // app.use(logger);
  // app.use(bodyParser);
  app.use(methodOverride());
  app.use(function(req, res, next) {
    res.set('X-Powered-By', 'Flight Tracker');
    next();
  });
  
  app.use(express.static(path.join(__dirname, 'public')));

  // dev only
  // if ('development' == app.get('env')) {
  //   app.use(express.errorHandler());
  // }

  app.get('/flight/:number', routes.flight);
  app.get('/flight/:number/arrived', routes.arrived);
  app.get('/list', routes.list);

  return app;
}
