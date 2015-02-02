var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var expressSession = require('express-session')

	var express = require('express');
	var session = require('connect-mongo');
	var routes = require('./routes');
	var twilioF = require('./twiloFunctions')
	// var socketF = require('./socketFunctions')
	var passport = require('passport');
	var path = require('path');
	var nStore = require('nstore');
	var client = require('twilio');


	var app = express();

	var http = require('http'),
	db = require('./db');

	var server = http.createServer(app);
	var io = require('socket.io')(server);

	// var io = require('socket.io').http.ser;
	// add passport information here

	// end passport information

	var MongoStore = require('connect-mongo')(expressSession);
	var users = nStore.new('data/users.db', function (){
		console.log('loaded users.db');
	});

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
	console.log(twilioF);

	app.get('/home', routes.home);
	app.get('/login', routes.login);
	app.post('/login', 
		passport.authenticate('local', { successRedirect: '/',
																		failureRedirect: '/login',
																		failureFlash: 'Invalid username or password.',
																		successFlash: 'Welcome!'}));

	// app.get('/flight/:number', routes.flight);


	// Start the server 

	var speakeasy = require('speakeasy');

	server.listen(3001, function() {
		console.log('Express server listening on port 3001');
	});

	// user definition function

	function createUser(phone_number, code, socket) {
		console.log('Creating User');
		users.save(phone_number, {code: code, verified: false}, function (saverr) {
			console.log(code)
			if (saverr) { throw saverr; }
			client.sendSms({
					to: phone_number,
					from: process.env.twilio_number,
					body: 'Your verification code is: ' + code
			}, function(twilioerr, responseData) {
				if (twilioerr) { 
					users.remove(phone_number, function(remerr) {if (remerr) { throw remerr; }});
					socket.emit('update', {message: "Invalid phone number!"});
				} else {
					socket.emit('code_generated');
				}
			});
		});
	}

	// socket io information

	io.sockets.on('connection', function(socket) {
	console.log('socket.io connected');
	socket.on('register', function(data) {
		console.log('register request');
		var code = speakeasy.totp({key: 'abc123'});
		console.log(code);
		users.get(data.phone_number, function (geterr, doc, key) {
			if (geterr) {
				createUser(data.phone_number, code, socket);
				console.log('error: ');
			}
			else if (twiloF.checkVerified(socket, doc.verified, data.phone_number) == false) {
				socket.emit('update', {message: "You have already requested a verification code for that number!"});
				socket.emit('code_generated');
				console.log('code generated');
			}
		});

	});

	io.on('verify', function(data) {
			var code = Math.floor((Math.random()*999999)+111111);
			users.get(data.phone_number, function (geterr, doc, key) {
				if (geterr) {
					socket.emit('reset');
					socket.emit('update', {message: "You have not requested a verification code for " + data.phone_number + " yet!"});
				}
				else if (twilioF.checkVerified(socket, doc.verified, data.phone_number) == false && doc.code == parseInt(data.code)) {
					socket.emit('verified');
					socket.emit('update', {message: "You have successfully verified " + data.phone_number + "!"});
					users.save(data.phone_number, {code: parseInt(data.code), verified: true}, function (saverr) { if (saverr) { throw saverr; }});
				}
				else {
					socket.emit('update', {message: "Invalid verification code!"});
				}
			});

		});
	});


// start the server
