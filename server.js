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
		var books = db.collection("shelf");
		var requests = db.collection("requests");
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
								"state": req.body.state.replace(/\b[a-z]/g, function(letter) {
									return letter.toUpperCase();
								}),
								"zip": req.body.zip,
								"booksAdded": 0,
								"books": [],
								"incomingRequests": [],
								"outgoingRequests": []
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
				users.find({"email": req.session.user.email}).toArray(function(err, result) {
					req.session.user = result[0];
					res.render("profile.ejs", {"csrfToken": req.csrfToken(), user: req.session.user, "passwordUpdateMessage": passwordUpdateMessage});
					passwordUpdateMessage = undefined;
				});
			} else {
				res.redirect("/");
			}
		});

		app.post("/update", parser, function(req, res) {
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

		app.get("/dashboard", function(req, res) {
			users.find({"email": req.session.user.email}).toArray(function(err, result) {
				if (err) {
					res.end("error in database");
				} else {
					// Update information in req.session.user
					req.session.user = result[0];
					if (result[0].books.length == 0) {
						res.render("dashboard.ejs", {"user": req.session.user, "csrfToken": req.csrfToken(), "userBooks": undefined});
					} else {
						var isbns = result[0].books;
						var userBooks = [];
						var userRequests = [];
						var booksPulled = false;
						var incomingRequestsPulled = false;
						var outgoingRequestsPulled = false;

						for (var isbn in isbns) {
							books.find({"isbn": isbns[isbn]}).toArray(function(err, bookResult) {
								userBooks.push(bookResult[0]);
								if (userBooks.length == isbns.length) {
									booksPulled = true;
									allDataPulled(booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
								}
							})
						}

						if (result[0].incomingRequests.length == 0) {
							incomingRequestsPulled = true;
							allDataPulled(booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
						} else {
							for (var item in result[0].incomingRequests) {
								requests.find({"requestID": result[0].incomingRequests[item]}).toArray(function(err, request) {
									userRequests.push(request[0]);
									// requests.length must equal the sum of incoming and outgoing requests.
									if (userRequests.length == result[0].incomingRequests.length + result[0].outgoingRequests.length) {
										incomingRequestsPulled = true;
										outgoingRequestsPulled = true;
										allDataPulled(booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
									}
								});
							}
						}

						if (result[0].outgoingRequests.length == 0) {
							outgoingRequestsPulled = true;
							allDataPulled(booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);	
						} else {
							for (var item in result[0].outgoingRequests) {
								requests.find({"requestID": result[0].outgoingRequests[item]}).toArray(function(err, request) {
									userRequests.push(request[0]);
									if (userRequests.length == result[0].incomingRequests.length + result[0].outgoingRequests.length) {
										incomingRequestsPulled = true;
										outgoingRequestsPulled = true;
										allDataPulled(booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
									}
								});
							}
						}
					}
				}
			})

			function allDataPulled (booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests) {
				if (booksPulled && incomingRequestsPulled && outgoingRequestsPulled) {
					res.render("dashboard.ejs", {"user": req.session.user, "csrfToken": req.csrfToken(), "userBooks": userBooks, "userRequests": userRequests});
				}
			}
		});

		app.post("/addbook", parser, function(req, res) {
			users.find({"email": req.session.user.email}).toArray(function(err, result) {
				if (result[0].books.indexOf(req.body.book.isbn) > -1) {
					res.status(200);
					res.end();
				} else {
					users.update(
						{"email": req.session.user.email},
						{"$addToSet": {"books": req.body.book.isbn}, "$inc": {"booksAdded": 1}},
						function() {
							books.find({"isbn": req.body.book.isbn}).toArray(function(err, result) {
								if (result[0]) {
									books.update(
										{"isbn": req.body.book.isbn},
										{"$addToSet": {"owners": req.session.user.email}},
										function() {
											res.status(201);
											res.end();
										}
									);
								} else {
									books.insert({
										"owners": [req.session.user.email],
										"title": req.body.book.title,
										"link": req.body.book.link,
										"image": req.body.book.image,
										"authors": req.body.book.authors,
										"categories": req.body.book.categories,
										"pages": req.body.book.pages,
										"description": req.body.book.description,
										"isbn": req.body.book.isbn
									}, function() {
										res.status(201);
										res.end();
									})							
								}
							});
						}
					);
				}
			});
		});

		app.post("/remove", parser, function(req, res) {
			users.update(
				{"email": req.session.user.email},
				{"$inc": {"booksAdded": -1}, "$pull": {"books": req.body.isbn}},
				function() {
					books.find({"isbn": req.body.isbn}).toArray(function(err, result) {
						if (result[0].owners.length > 1) {
							books.update(
								{"isbn": req.body.isbn},
								{"$pull": {"owners": req.session.user.email}},
								function() {
									res.status(201);
									res.end();
								}
							);
						} else {
							books.remove({"isbn": req.body.isbn}, function() {
								res.status(201);
								res.end();
							});
						}
					});
				}
			);
		});

		app.get("/all", function(req, res) {
			if (req.session.user) {
				// needed to make sure 'You own it' appears when user goes to all books. Otherwise newly added books will have "trade" button.
				users.find({"email": req.session.user.email}).toArray(function(err, result) {
					req.session.user = result[0];
					books.find({}).toArray(function(err, results) {
						if (err) {
							res.end("Error in database");
						} else {
							var allUsersBooks = results;
							res.render("all.ejs", {user: req.session.user, allUsersBooks: allUsersBooks, "csrfToken": req.csrfToken()});
						}
					});					
				});
			} else {
				res.redirect("/");
			}
		});

		app.get("/bookOwners/:selectedBook", function(req, res) {
			users.find({"books": req.params.selectedBook}).toArray(function(err, owners) {
				res.send(owners);
				res.end();
			})
		});

		app.post("/request", parser, function(req, res) {
			var user1Updated = false;
			var user2Updated = false;
			var requestsUpdated = false;
			var requestID = req.body.selectedBookIsbn + req.body.otherUserBookIsbn

			users.update(
				{"email": req.session.user.email},
				{"$push": {"outgoingRequests": requestID}},
				function() {
					user1Updated = true;
					isResponseReady();
				}
			)

			users.update(
				{"email": req.body.ownerEmail},
				{"$push": {"incomingRequests": requestID}},
				function() {
					user2Updated = true;
					isResponseReady();
				}
			)

			requests.insert({
				"requestID": requestID,
				"requestedBook": {"isbn": req.body.otherUserBookIsbn, "title": req.body.otherUserBookTitle},
				"tradedBook": {"isbn": req.body.selectedBookIsbn, "title": req.body.selectedBookTitle},
				"requestedBy": {"name": req.session.user.name, "email": req.session.user.email},
				"requestedFrom": {"name": req.body.ownerName, "email": req.body.ownerEmail},
				"status": "Pending"
			}, function () {
				requestsUpdated = true;
				isResponseReady();
			});

			function isResponseReady() {
				if (user1Updated && user2Updated && requestsUpdated) {
					res.status(201);
					res.end();
				}
			}

			/*
			users.update(
				{"email": req.session.user.email},
				{"$push": {"outgoingRequests": {"requestID": req.body.selectedBookIsbn + req.body.otherUserBookIsbn, "outGoingBook": {"isbn": req.body.selectedBookIsbn, "title": req.body.selectedBookTitle}, "incomingBook": {"isbn": req.body.otherUserBookIsbn, "title": req.body.otherUserBookTitle}, "otherUser": {"email": req.body.ownerEmail, "name": req.body.ownerName}, "status": "Pending"}}}
			);
			users.update(
				{"email": req.body.ownerEmail},
				{"$push": {"incomingRequests": {"requestID": req.body.selectedBookIsbn + req.body.otherUserBookIsbn, "outGoingBook": {"isbn": req.body.otherUserBookIsbn, "title": req.body.otherUserBookTitle}, "incomingBook": {"isbn": req.body.selectedBookIsbn, "title": req.body.selectedBookTitle}, "otherUser": {"email": req.session.user.email, "name": req.session.user.name}, "status": "Pending"}}}
			);
			res.status(201);
			res.end();*/
		});

		app.post("/cancel-request", parser, function(req, res) {
			var user1Updated = false;
			var user2Updated = false;
			var requestsUpdated = false;

			users.update(
				{"email": req.session.user.email},
				{"$pull": {"outgoingRequests": req.body.requestID}},
				function() {
					user1Updated = true;
					if (user1Updated && user2Updated) {
						res.status(200);
						res.end();
					}
				}
			);

			users.update(
				{"email": req.body.otherUser},
				{"$pull": {"incomingRequests": req.body.requestID}},
				function() {
					user2Updated = true;
					if (user1Updated && user2Updated) {
						res.status(200);
						res.end();
					}
				}
			);

			requests.remove({"requestID": req.body.requestID}, function() {
				requestsUpdated = true;
				if (user1Updated && user2Updated) {
					res.status(200);
					res.end();
				}
			})
		});
	}
});

var port = Number(process.env.PORT || 8080);
app.listen(port);	