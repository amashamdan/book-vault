var express = require("express");
var mongodb = require("mongodb");

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var books = db.collection("shelf");
	router.route("/")
	.get(function(req, res) {
		/* If the user's session timed out, or if no user is logged in, client is redirected to login page. */
		if (!req.session.user) {
			res.redirect("/login");
			res.end();
		}
		users.find({"email": req.session.user.email}).toArray(function(err, result) {
			// Needed to make sure 'You own it' appears when user goes to all books. Otherwise newly added books will have "trade" button.
			req.session.user = result[0];
			// User's password is deleted from the cookie.
			delete req.session.user.password;
			/* All books are looked up. */
			books.find({}).toArray(function(err, results) {
				if (err) {
					res.end("Error in database");
				} else {
					/* all.ejs is rendered. user, all books and csrfToken are passed to all.ejs. */
					var allUsersBooks = results;
					res.render("all.ejs", {user: req.session.user, allUsersBooks: allUsersBooks, "csrfToken": req.csrfToken()});
				}
			});					
		});
	});
});

module.exports = router;