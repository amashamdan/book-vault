var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db){ 
	if (err) {
		res.end("Failed to connect to database");
	}
	var users = db.collection("users");
	router.route("/")
	.get(function(req, res) {
		res.render("register.ejs", {"csrfToken": req.csrfToken(), "message": undefined});
	})
	.post(parser, function(req, res) {
		users.find({}).toArray(function(err, results) {
			var found = false;
			for (var result in results) {
				if (results[result].email == req.body.email) {
					found = true;
					break;
				}
			}
			if (found) {
				res.render("register.ejs", {"csrfToken": req.csrfToken(), "message": "Email already registered."})
			} else {
				bcrypt.genSalt(10, function(err, salt) {
				    bcrypt.hash(req.body.password1, salt, function(err, hash) {
						users.insert({
							"name": req.body.name,
							"email": req.body.email,
							"password": hash,
							"address": req.body.address,
							"city": req.body.city,
							"state": req.body.state.replace(/\b[a-z]/g, function(letter) {
								return letter.toUpperCase();
							}),
							"zip": req.body.zip,
							"booksAdded": 0,
							"books": [],
							"incomingRequests": [],
							"outgoingRequests": []
						}, function() {
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