var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");

var app = express();
app.use(secure);

var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

app.use("/stylesheets", express.static(__dirname + "/views/stylesheets"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	} else {
		var users = db.collection("users");

		app.get("/", function(req, res) {
			res.render("index.ejs", {"user": undefined});
		});

		app.get("/login", function(req, res) {
			res.render("login.ejs", {"message": undefined, "messageType": undefined});
		});

		/*app.post("/login", passport.authenticate("local"), function(req, res) {
			res.render("index.ejs", {"user": req.user});
		});*/

		app.post("/login", parser, function(req, res) {
			users.find({"email": req.body.email}).toArray(function(err, result) {
				if (result.length == 0) {
					var message = "Email not found in database!";
					var messageType = "error";
					res.render("login.ejs", {"message": message, "messageType": messageType});
				} else {
					bcrypt.compare(req.body.password, result[0].password, function(err, checkResult) {
					    if (checkResult) {
					    	res.redirect("/");
					    } else {
					    	var message = "Incorrect password.";
					    	var messageType = "error";
					    	res.render("login.ejs", {"message": message, "messageType": messageType});
					    }
					});
				}
			});
		});

		app.get("/signup", function(req, res) {
			res.render("register.ejs", {"message": undefined});
		});

		app.post("/signup", parser, function(req, res) {
			users.find({}).toArray(function(err, results) {
				var found = false;
				for (var result in results) {
					if (results[result].email == req.body.email) {
						found = true;
						break;
					}
				}
				if (found) {
					res.render("register.ejs", {"message": "Email already registered."})
				} else {
					bcrypt.genSalt(10, function(err, salt) {
					    bcrypt.hash(req.body.password1, salt, function(err, hash) {
							users.insert({
								"name": req.body.name,
								"email": req.body.email,
								"password": hash,
								"address": req.body.address,
								"city": req.body.city,
								"state": req.body.state,
								"zip": req.body.zip
							}, function() {
								var message = "Thank you for registering. Now you can login to start using the Vault.";
								var messageType = "success";
								res.render("login.ejs", {"message": message, "messageType": messageType});
							})
					    });
					});
				}
			});
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);