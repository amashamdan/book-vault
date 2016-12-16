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
		if (!req.session.user) {
			res.redirect("/login");
			res.end();
		}
		// needed to make sure 'You own it' appears when user goes to all books. Otherwise newly added books will have "trade" button.
		users.find({"email": req.session.user.email}).toArray(function(err, result) {
			req.session.user = result[0];
			delete req.session.user.password;
			books.find({}).toArray(function(err, results) {
				if (err) {
					res.end("Error in database");
				} else {
					var allUsersBooks = results;
					res.render("all.ejs", {user: req.session.user, allUsersBooks: allUsersBooks, "csrfToken": req.csrfToken()});
				}
			});					
		});
	});
});

module.exports = router;