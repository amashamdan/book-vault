var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var passport = require("passport");
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
		var message = undefined;
		var messageType = undefined;

		app.get("/", function(req, res) {
			res.render("index.ejs");
		});

		app.get("/login", function(req, res) {
			res.render("login.ejs", {"message": message, "messageType": messageType});
			message = undefined;
		});

		app.post("/login", parser, function(req, res) {
			users.find({"email": req.body.email}).toArray(function(err, result) {
				if (result.length == 0) {
					message = "Email not found in database!";
					messageType = "error";
					res.redirect("/login");
				} else {
					bcrypt.compare(req.body.password, result[0].password, function(err, checkResult) {
					    if (checkResult) {
					    	res.redirect("/");
					    } else {
					    	message = "Incorrect password.";
					    	messageType = "error";
					    	res.redirect("/login");
					    }
					});
				}
			});
		});

		app.get("/signup", function(req, res) {
			users.find({}).toArray(function(err, results) {
				var emails = [];
				for (var result in results) {
					emails.push(results[result].email);
				}
				res.render("register.ejs", {"emails": emails});	
			});
		});

		app.post("/signup", parser, function(req, res) {
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
						message = "Thank you for registering. Now you can login to start using the Vault.";
						messageType = "success";
						res.redirect("/login");
					})
			    });
			});
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);