
/*
 * GET home page.
 */

module.exports = {

	home: function(req, res) {
    res.render('home', {title: 'Not the homepage'});
  },

  login: function(req, res) {
  	res.render('login', {title: 'User Authentication'});
  }

};
