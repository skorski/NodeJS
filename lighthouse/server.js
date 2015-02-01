var http = require('http'),
	db = require('./db'),
  app = require('./app')(db, http);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// nvm ls-remote
// nvm use 0.11.15
