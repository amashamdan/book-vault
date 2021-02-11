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

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		// res.end("Failed to connect to database");
	}
	var users = db.collection("users");
	/* This is set to an actual message when the user successfully changes the password. */
	var passwordUpdateMessage = undefined;

	router.route("/")
	.get(function(req, res) {
		/* When the profile page is requested. */
		if (req.session.user) {
			/* User's object is looked up using the email. */
			users.find({"email": req.session.user.email}).toArray(function(err, result) {
				/* user's cookie is updated and password is deleted. */
				req.session.user = result[0];
				delete req.session.user.password;
				/* profile.ejs is rendered. */
				res.render("profile.ejs", {"csrfToken": req.csrfToken(), user: req.session.user, "passwordUpdateMessage": passwordUpdateMessage});
				// if outside function, may be ran before render, so message on password change may not appear. It resets the 'Password changed successfully' message.
				passwordUpdateMessage = undefined;
			});
		} else {
			/* If the user's session timed out, or if no user is logged in, client is redirected to login page. */
			res.redirect("/login");
		}
	});
	/* Called when the user submits a form to change the address. */
	router.route("/update")
	.post(parser, function(req, res) {
		/* User's object is found using email address. */
		users.update(
			{"email": req.session.user.email},
			/* Information updated using $set. Note that each word in state is capitalized before being saved. */
			{"$set": {"name": req.body.name, "address": req.body.address, "city": req.body.city, "zip": req.body.zip, "state": req.body.state.replace(/\b[a-z]/g, function(letter) {
					return letter.toUpperCase();
				})}},
			function() {
				/* After update, user is redirected to the profile page again (page is reloaded). */
				res.redirect("/profile");
			}
		);
	});
	/* Called when the user submits password change form. */
	router.route("/updatePassword")
	.post(parser, function(req, res) {
		/* password is salted and hashed. */
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(req.body.password1, salt, function(err, hash) {
				/* Once the password is hashed, it is saved in the user's object using $set. */
				users.update(
					{"email": req.session.user.email},
					{"$set": {"password": hash}},
					function() {
						/* Can save info to req.session.user directly. User is looked up to update information. passwordUpdateMessage is set. Response is directed to /profile. */
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