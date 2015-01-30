
/**
 * Module dependencies.
 */

var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var expressSession = require('express-session')

module.exports = function(flights, db) {
  var express = require('express');
  var session = require('connect-mongo');
  var routes = require('./routes')(flights);
  var path = require('path');
  var app = express();
  var MongoStore = require('connect-mongo')(expressSession);

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set()
  
  // app.use(express.favicon());
  // app.use(logger);
  
  app.use(bodyParser());
  app.use(cookieParser());

  app.use(expressSession({
    cookie: { maxAge: 1000*60*2 },
    secret: "alkjsdfhqwero",
    store: new MongoStore({
      mongoose_connection: db
    })
  }));

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
  app.put('/flight/:number/arrived', routes.arrived);
  app.get('/list', routes.list);
  app.get('/arrivals', routes.arrivals)
  return app;
}
