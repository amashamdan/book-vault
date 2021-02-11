var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");
/* All commented out modules below not needed here because they are used in app.use in server.js. All the above are not used so they have to be required here. */
//var session = require("client-sessions");
//var csrf = require('csurf');
//var secure = require('express-force-https');
//var ejs = require("ejs");
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
	router.route("/")
	.get(function(req, res) {
		res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": undefined, "messageType": undefined});
	})
	.post(parser, function(req, res) {
		/* The entered email is looked up in the database. */
		users.find({"email": req.body.email}).toArray(function(err, result) {
			if (result.length == 0) {
				/* If the email is not found, login.ejs is rendered again with an error message. */
				var message = "Email not found in database!";
				var messageType = "error";
				res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": message, "messageType": messageType});
			} else {
				/* If the email if found, the entered password is compared with stored password after being hashed. */
				bcrypt.compare(req.body.password, result[0].password, function(err, checkResult) {
					/* If checkResult is true, password match and user redirected to home page after creating a session. */
				    if (checkResult) {
				    	req.session.user = result[0];
				    	delete req.session.user.password;
				    	res.redirect("/");
				    } else {
				    	/* If passwords don't match, login.ejs is renered again with an error message. */
				    	var message = "Incorrect password.";
				    	var messageType = "error";
				    	res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": message, "messageType": messageType});
				    }
				});
			}
		});
	});
});

module.exports = router;