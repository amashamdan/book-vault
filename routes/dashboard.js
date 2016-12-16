var express = require("express");
var mongodb = require("mongodb");

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var books = db.collection("shelf");
	var requests = db.collection("requests");

	router.route("/")
	.get(function(req, res) {
		if (!req.session.user) {
			res.redirect("/login");
			res.end();
		}

		users.find({"email": req.session.user.email}).toArray(function(err, result) {
			// Update information in req.session.user
			req.session.user = result[0];
			delete req.session.user.password;

			var isbns = result[0].books;
			var userBooks = [];
			var userRequests = [];
			var booksPulled = false;
			var incomingRequestsPulled = false;
			var outgoingRequestsPulled = false;

			if (isbns.length == 0) {
				booksPulled = true;
			}
			for (var isbn in isbns) {
				books.find({"isbn": isbns[isbn]}).toArray(function(err, bookResult) {
					userBooks.push(bookResult[0]);
					if (userBooks.length == isbns.length) {
						booksPulled = true;
						allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
					}
				})
			}

			if (result[0].incomingRequests.length == 0) {
				incomingRequestsPulled = true;
				allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
			} else {
				for (var item in result[0].incomingRequests) {
					requests.find({"requestID": result[0].incomingRequests[item]}).toArray(function(err, request) {
						userRequests.push(request[0]);
						// requests.length must equal the sum of incoming and outgoing requests.
						if (userRequests.length == result[0].incomingRequests.length + result[0].outgoingRequests.length) {
							incomingRequestsPulled = true;
							outgoingRequestsPulled = true;
							allDataPulled(req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests);
						}
					});
				}
			}

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

	router.route("/user/:email")
	.get(function(req, res) {
		users.find({"email": req.params.email}).toArray(function(err, result) {
			res.send({"address": result[0].address, "city": result[0].city, "state": result[0].state, "zip": result[0].zip});
			res.end();
		});
	});
});

function allDataPulled (req, res, booksPulled, incomingRequestsPulled, outgoingRequestsPulled, userBooks, userRequests) {
	if (booksPulled && incomingRequestsPulled && outgoingRequestsPulled) {
		res.render("dashboard.ejs", {"user": req.session.user, "csrfToken": req.csrfToken(), "userBooks": userBooks, "userRequests": userRequests});
	}
}

module.exports = router;