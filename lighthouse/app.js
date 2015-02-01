var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var expressSession = require('express-session')

module.exports = function(db, http) {
  var express = require('express');
  var session = require('connect-mongo');
  var routes = require('./routes');
  var passport = require('passport');
  var path = require('path');
  var io = require('socket.io').listen(http);
  var speakeasy = require('speakeasy');
  var client = require('twilio');
  var app = express();

  // add passport information here

  // end passport information

  var MongoStore = require('connect-mongo')(expressSession);

  // all environments
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set()

  app.use(logger('combined'));
  app.use(bodyParser());
  app.use(cookieParser());

  app.use(expressSession({
    cookie: { maxAge: 1000*60*2 },
    secret: "ffsdejchcjhslsjkl",
    store: new MongoStore({
      mongooseConnection: db
    })
  }));

  app.use(methodOverride());
  app.use(function(req, res, next) {
    res.set('X-Powered-By', 'Dan Skorski');
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function(req, res, next){
  	var err = req.session.error,
  		msg = req.session.notice,
  		success = req.session.success;

  	delete req.session.error;
  	delete req.session.success;
  	delete req.session.notice;

  	if (err) res.locals.error = err;
  	if (msg) res.locals.notice = msg;
  	if (success) res.locals.success = success;

  	next();

  });
  
  app.use(express.static(path.join(__dirname, 'public')));

  // set routes below:
   console.log(routes);
  app.get('/home', routes.home);
  app.get('/login', routes.login);
  app.post('/login', 
  	passport.authenticate('local', { successRedirect: '/',
  																	failureRedirect: '/login',
  																	failureFlash: 'Invalid username or password.',
  																	successFlash: 'Welcome!'}));

  // app.get('/flight/:number', routes.flight);
  return app;
}