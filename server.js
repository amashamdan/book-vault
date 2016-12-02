var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var passport = require("passport");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});

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

		app.get("/", function(req, res) {
			res.render("index.ejs");
		});

		app.get("/login", function(req, res) {
			res.render("login.ejs", {"message": message});
			message = undefined;
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
			users.insert({
				"name": req.body.name,
				"email": req.body.email,
				"password": req.body.password1,
				"address": req.body.address,
				"city": req.body.city,
				"state": req.body.state,
				"zip": req.body.zip
			}, function() {
				message = "Thank you for registering. Now you can login to start using the Vault.";
				res.redirect("/login");
			})
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);