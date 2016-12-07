var express = require("express");
var secure = require('express-force-https');
var mongodb = require("mongodb");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var bcrypt = require("bcryptjs");
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
app.use(bodyParser.urlencoded({extended: true}));
app.use(csrf());

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	} else {
		var users = db.collection("users");
		var passwordUpdateMessage = undefined;


		app.get("/", function(req, res) {
			if (req.session.user) {
				res.render("index.ejs", {"user": req.session.user});				
			} else {
				res.render("index.ejs", {"user": undefined});
			}
		});

		app.get("/login", function(req, res) {
			res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": undefined, "messageType": undefined});
		});

		app.post("/login", parser, function(req, res) {
			users.find({"email": req.body.email}).toArray(function(err, result) {
				if (result.length == 0) {
					var message = "Email not found in database!";
					var messageType = "error";
					res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": message, "messageType": messageType});
				} else {
					bcrypt.compare(req.body.password, result[0].password, function(err, checkResult) {
					    if (checkResult) {
					    	req.session.user = result[0];
					    	delete req.session.user.password;
					    	res.redirect("/");
					    } else {
					    	var message = "Incorrect password.";
					    	var messageType = "error";
					    	res.render("login.ejs", {"csrfToken": req.csrfToken(), "message": message, "messageType": messageType});
					    }
					});
				}
			});
		});

		app.get("/logout", function(req, res) {
			req.session.reset();
			res.redirect("/");
		});

		app.get("/signup", function(req, res) {
			res.render("register.ejs", {"csrfToken": req.csrfToken(), "message": undefined});
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
								"state": req.body.state.replace(/[a-z]/, function(letter) {
									return letter.toUpperCase();
								}),
								"zip": req.body.zip,
								"booksAdded": 0
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

		app.get("/profile", function(req, res) {
			if (req.session.user) {
				res.render("profile.ejs", {"csrfToken": req.csrfToken(), user: req.session.user, "passwordUpdateMessage": passwordUpdateMessage});
				passwordUpdateMessage = undefined;
			} else {
				res.redirect("/");
			}
		});

		app.post("/update", parser, function(req, res) {
			users.update(
				{"email": req.session.user.email},
				{"$set": {"name": req.body.name, "address": req.body.address, "city": req.body.city, "state": req.body.state, "zip": req.body.zip}},
				function() {
					// Can save info to req.session.user directly.
					users.find({"email": req.session.user.email}).toArray(function(err, result) {
						req.session.user = result[0];
						res.redirect("/profile");
					});
				}
			);
		});

		app.post("/updatePassword", parser, function(req, res) {
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
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);