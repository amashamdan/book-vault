var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database");
	}
	var users = db.collection("users");
	var passwordUpdateMessage = undefined;

	router.route("/")
	.get(function(req, res) {
		if (req.session.user) {
			users.find({"email": req.session.user.email}).toArray(function(err, result) {
				req.session.user = result[0];
				delete req.session.user.password;
				res.render("profile.ejs", {"csrfToken": req.csrfToken(), user: req.session.user, "passwordUpdateMessage": passwordUpdateMessage});
				// if outside function, may be ran before render, so message on password change may not appear.
				passwordUpdateMessage = undefined;
			});
		} else {
			res.redirect("/login");
		}
	});

	router.route("/update")
	.post(parser, function(req, res) {
		users.update(
			{"email": req.session.user.email},
			{"$set": {"name": req.body.name, "address": req.body.address, "city": req.body.city, "zip": req.body.zip, "state": req.body.state.replace(/\b[a-z]/g, function(letter) {
					return letter.toUpperCase();
				})}},
			function() {
				res.redirect("/profile");
			}
		);
	});

	router.route("/updatePassword")
	.post(parser, function(req, res) {
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(req.body.password1, salt, function(err, hash) {
				users.update(
					{"email": req.session.user.email},
					{"$set": {"password": hash}},
					function() {
						// Can save info to req.session.user directly.
						users.find({"email": req.session.user.email}).toArray(function(err, result) {
							req.session.user = result[0];
							passwordUpdateMessage = "Password changed successfully."
							res.redirect("/profile");
						});
					}
				)
		    });
		});
	});
});

module.exports = router;