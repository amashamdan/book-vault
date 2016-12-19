var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var session = require("client-sessions");
/* Cross site request forgery. */
var csrf = require('csurf');

var app = express();
/* To ensure https */
app.use(secure);

var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;
/* Load scripts and stylesheets. */
app.use("/stylesheets", express.static(__dirname + "/views/stylesheets"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
/* Creating a session to store user's information. That ensure the user stays logged in. */
app.use(session({
	cookieName: "session",
	// Random string.
	secret: "sdjfngsluifndzljbgsjlgbns",
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
	httpOnly: true, //Don't let browser javascript access cookies.
	secure: true, //only use cookies over https
	ephemeral: true //Delete this cookie when the broswer is closed.
}));

/* THIS MUST LIKE THIS IN THIS ORDER. Needed for csrf to work properly. */
app.use(require("body-parser").urlencoded({extended: true}));
app.use(csrf());

/* Calling routes. */
var login = require("./routes/login");
app.use("/login", login);
var signup = require("./routes/signup");
app.use("/signup", signup);
var profile = require("./routes/profile");
app.use("/profile", profile);
var dashboard = require("./routes/dashboard");
app.use("/dashboard", dashboard);
var addbook = require("./routes/addbook");
app.use("/addbook", addbook);
var remove = require("./routes/remove");
app.use("/remove", remove);
var all = require("./routes/all");
app.use("/all", all);
var request = require("./routes/request");
app.use("/request", request);
var action = require("./routes/action");
app.use("action", action);
/* Establish connection to mongo. */
MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		/* If connection to mongo fails. */
		res.end("Failed to connect to database.");
	} else {
		/* This collection has all books added by all users. */
		var books = db.collection("shelf");
		/* get request on root folder. */
		app.get("/", function(req, res) {
			/* If a user is logged in: */
			if (req.session.user) {
				/* Four books are loaded. index.ejs is rendered. The user and the 4 loaded books are passed to index.ejs. */
				books.find({}).limit(4).toArray(function(err, results) {
					res.render("index.ejs", {"user": req.session.user, "books": results});
				})			
			} else {
				/* If user is not logged in, index.ejs is rendered directly. user is set to undefined because it will always be checked in index.ejs. */
				res.render("index.ejs", {"user": undefined});
			}
		});
		/* Get request on logout. It resets session (deletes user's cookie). and redirects to home page. */
		app.get("/logout", function(req, res) {
			req.session.reset();
			res.redirect("/");
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);	