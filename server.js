var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var session = require("client-sessions");
var csrf = require('csurf');

var app = express();
app.use(secure);

var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

app.use("/stylesheets", express.static(__dirname + "/views/stylesheets"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));

app.use(session({
	cookieName: "session",
	secret: "sdjfngsluifndzljbgsjlgbns",
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
	httpOnly: true, //Don't let browser javascript access cookies.
	secure: true, //only use cookies over https
	ephemeral: true //Delete this cookie when the broswer is closed.
}));

/* THIS MUST LIKE THIS IN THIS ORDER */
app.use(require("body-parser").urlencoded({extended: true}));
app.use(csrf());

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

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	} else {
		var users = db.collection("users");
		var books = db.collection("shelf");
		var requests = db.collection("requests");
		
		app.get("/", function(req, res) {
			if (req.session.user) {
				books.find({}).limit(4).toArray(function(err, results) {
					res.render("index.ejs", {"user": req.session.user, "books": results});
				})			
			} else {
				res.render("index.ejs", {"user": undefined});
			}
		});

		app.get("/logout", function(req, res) {
			req.session.reset();
			res.redirect("/");
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);	