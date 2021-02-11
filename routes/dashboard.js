var express = require("express");
var mongodb = require("mongodb");
var dotenv = require("dotenv");
dotenv.config();

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		// res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var books = db.collection("shelf");
	var requests = db.collection("requests");

	router.route("/")
	/* If the user's session timed out, or if no user is logged in, client is redirected to login page. */
	.get(function(req, res) {
		if (!req.session.user) {
			res.redirect("/login");
			res.end();
		}
		/* User's info are looked up in the database using email. */
		users.find({"email": req.session.user.email}).toArray(function(err, result) {
			// Update information in req.session.user and delete password.
			req.session.user = result[0];
			delete req.session.user.password;
			/* The list of isbn identifying the user's book are saved in isbns. */
			var isbns = result[0].books;
			/* This array will hold user's books' objects. */
			var userBooks = [];
			/* The information related to incoming and outgoing requests are saved in userRequests. */
			var userRequests = [];
			/* Three tracking variables. All need to be true for the reponse to be sent. */
			var booksPulled = false;
			var incomingRequestsPulled = false;
			var outgoingRequestsPulled = false;
			/* If the user has no books, a tracking variable set to true. */
			if (isbns.length == 0) {
				booksPulled = true;
			}
			/* If the user has variables, each book's isbn is used to lookup the book object in books collection. */
			for (var isbn in isbns) {
				books.find({"isbn": isbns[isbn]}).toArray(function(err, bookResult) {
					/* Each book's object is pushed into userBooks. */
					userBooks.push(bookResult[0]);
					/* When userBooks and isbns arrays have the same length, it means that all books' object have been loaded. */
					if (userBooks.length == isbns.length) {
						booksPulled = true;
						/* allDataPulled function is called to check whether response is ready or not. */
						allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
					}
				})
			}
			/* If the user has no incoming requests, its tracking variable is set to true and allDataPulled is called. */
			if (result[0].incomingRequests.length == 0) {
				incomingRequestsPulled = true;
				allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
			/* If the user has incoming requests: */
			} else {
				/* The requestID found in user's object is used to find the request in requests collection. */
				for (var item in result[0].incomingRequests) {
					requests.find({"requestID": result[0].incomingRequests[item]}).toArray(function(err, request) {
						/* The request object is into userRequests array. */
						userRequests.push(request[0]);
						// requests.length must equal the sum of incoming and outgoing requests. If that happend, both tracking variables are set to true, and allDataPulled is called.
						if (userRequests.length == result[0].incomingRequests.length + result[0].outgoingRequests.length) {
							incomingRequestsPulled = true;
							outgoingRequestsPulled = true;
							allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
						}
					});
				}
			}
			/* Same as the block above but for outgoing requests. */
			if (result[0].outgoingRequests.length == 0) {
				outgoingRequestsPulled = true;
				allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);	
			} else {
				for (var item in result[0].outgoingRequests) {
					requests.find({"requestID": result[0].outgoingRequests[item]}).toArray(function(err, request) {
						userRequests.push(request[0]);
						if (userRequests.length == result[0].incomingRequests.length + result[0].outgoingRequests.length) {
							incomingRequestsPulled = true;
							outgoingRequestsPulled = true;
							allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
						}
					});
				}
			}
		})
	});
	/* This is called when the user wants to see the email address of the other request's user. */
	router.route("/user/:email")
	.get(function(req, res) {
		/* The other user is looked up, his address info are sent as response. */
		users.find({"email": req.params.email}).toArray(function(err, result) {
			res.send({"address": result[0].address, "city": result[0].city, "state": result[0].state, "zip": result[0].zip});
			res.end();
		});
	});
});

/* The function checks if all tracking variables are true... In other words if all data have been updated, and then renders dashboard.ejs. Users information and books are passed. */
function allDataPulled (req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests) {
	if (booksPulled && incomingRequestsPulled && outgoingRequestsPulled) {
		res.render("dashboard.ejs", {"user": req.session.user, "csrfToken": req.csrfToken(), "userBooks": userBooks, "userRequests": userRequests});
	}
}

module.exports = router;