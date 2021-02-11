var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");
var dotenv = require("dotenv");
dotenv.config();

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db){ 
	if (err) {
		console.log(err)
		// res.end("Failed to connect to database");
	}
	var users = db.collection("users");
	/* Called when the sign up page is requested. */
	router.route("/")
	.get(function(req, res) {
		/* message here is undefined because it is checks in the ejs file. It has to be set to something even if undefined, otherwise an error will occur. */
		res.render("register.ejs", {"csrfToken": req.csrfToken(), "message": undefined});
	})
	/* Called when the user submits registration form. */
	.post(parser, function(req, res) {
		/* The users collection is searched for the entered email. email should be unique for each user. */
		users.find({"email": req.body.email}).toArray(function(err, results) {
			/* If the condition is met, it means the email is already in the database. register.ejs is rendered again with am error message. */
			if (results.length > 0) {
				res.render("register.ejs", {"csrfToken": req.csrfToken(), "message": "Email already registered."})
			/* If condition not met, it means that the email is not the database. */
			} else {
				/* Password is salted and hashed. */
				bcrypt.genSalt(10, function(err, salt) {
				    bcrypt.hash(req.body.password1, salt, function(err, hash) {
						/* When the password is salted and hashed, the user is inserted in the database. */
						users.insert({
							"name": req.body.name,
							"email": req.body.email,
							"password": hash,
							"address": req.body.address,
							"city": req.body.city,
							/* Capitalize each letter in the first word of state name. */
							"state": req.body.state.replace(/\b[a-z]/g, function(letter) {
								return letter.toUpperCase();
							}),
							"zip": req.body.zip,
							"booksAdded": 0,
							"books": [],
							"incomingRequests": [],
							"outgoingRequests": []
						}, function() {
							/* login page is rendered with  a success message. messageType decides the class of the shown message. */
							var message = "Thank you for registering. Now you can login to start using the Vault.";
							var messageType = "success";
							res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": message, "messageType": messageType});
						})
				    });
				});
			}
		});
	});
});

module.exports = router;