var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var passport = require("passport");

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
		app.get("/", function(req, res) {
			res.render("index.ejs");
		});

		app.get("/login", function(req, res) {
			res.render("login.ejs");
		});

		app.get("/signup", function(req, res) {
			res.render("register.ejs");
		})
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);