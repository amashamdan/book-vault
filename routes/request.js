var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
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
	var requests = db.collection("requests");
	/* Called when the user requests a trade with another user. */
	router.route("/")
	.post(parser, function(req, res) {
		/* Tracking variables, track updating the databse. */
		var user1Updated = false;
		var user2Updated = false;
		var requestsUpdated = false;
		/* A unique request ID is created by combining the isbn strings of the two traded books. */
		var requestID = req.body.selectedBookIsbn + req.body.otherUserBookIsbn
		/* The requesting user's information updated, the requestID is added to the outgoingRequests array. */
		users.update(
			{"email": req.session.user.email},
			{"$push": {"outgoingRequests": requestID}},
			function() {
				/* Trackign variable set to true and isResponseReady is called to check if the repsonse is ready or not. */
				user1Updated = true;
				isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
			}
		)
		/* Same as above but for the other user. */
		users.update(
			{"email": req.body.ownerEmail},
			{"$push": {"incomingRequests": requestID}},
			function() {
				user2Updated = true;
				isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
			}
		)
		/* requests collection is updated. The new request is inserted. Information added are: requestID, title and isbn of both books, names and email of both users, and the status of the request (Pending when the request is sent). */
		requests.insert({
			"requestID": requestID,
			"requestedBook": {"isbn": req.body.otherUserBookIsbn, "title": req.body.otherUserBookTitle},
			"tradedBook": {"isbn": req.body.selectedBookIsbn, "title": req.body.selectedBookTitle},
			"requestedBy": {"name": req.session.user.name, "email": req.session.user.email},
			"requestedFrom": {"name": req.body.ownerName, "email": req.body.ownerEmail},
			"status": "Pending"
		}, function () {
			/* Tracking variable updated and isResponseReady called. */
			requestsUpdated = true;
			isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
		});
	});
	/* Called when the user requests a book trade. All owners of the requested book are found and sent back to the client. */
	router.route("/bookOwners/:selectedBook")
	.get(function(req, res) {
		/* :selectedBook is the isbn of the requested book. It is looked up in the database and the list of owners is sent. */
		users.find({"books": req.params.selectedBook}).toArray(function(err, owners) {
			for (var owner in owners) {
				delete owners[owner].password;
			}
			res.send(owners);
			res.end();
		})
	});
});
/* The function checks if all documents are updated and sends a 201 status to the client. */
function isResponseReady(res, user1Updated, user2Updated, requestsUpdated) {
	if (user1Updated && user2Updated && requestsUpdated) {
		res.status(201);
		res.end();
	}
}

module.exports = router;