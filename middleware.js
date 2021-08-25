//middleware to make sure the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl; //allows the user to go to the url they originally intended on visiting
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};
