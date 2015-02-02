var http = require('http'),
	db = require('./db'),
	app = require('./app')(db, http);

var server = http.Server(app);
var speakeasy = require('speakeasy');

var	io = require('socket.io')(server);

io.on('connection', function(socket) {
	console.log('socket.io connected');
	socket.on('register', function(data) {
		var code = speakeasy.totp({key: 'abc123'});
		users.get(data.phone_number, function (geterr, doc, key) {
			if (geterr) {
				createUser(data.phone_number, code, socket);
			}
			else if (checkVerified(socket, doc.verified, data.phone_number) == false) {
				socket.emit('update', {message: "You have already requested a verification code for that number!"});
				socket.emit('code_generated');
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
				else if (checkVerified(socket, doc.verified, data.phone_number) == false && doc.code == parseInt(data.code)) {
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




server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
// nvm ls-remote
// nvm use 0.11.15
