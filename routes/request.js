var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var requests = db.collection("requests");
	router.route("/")
	.post(parser, function(req, res) {
		var user1Updated = false;
		var user2Updated = false;
		var requestsUpdated = false;
		var requestID = req.body.selectedBookIsbn + req.body.otherUserBookIsbn

		users.update(
			{"email": req.session.user.email},
			{"$push": {"outgoingRequests": requestID}},
			function() {
				user1Updated = true;
				isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
			}
		)

		users.update(
			{"email": req.body.ownerEmail},
			{"$push": {"incomingRequests": requestID}},
			function() {
				user2Updated = true;
				isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
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
			isResponseReady(res, user1Updated, user2Updated, requestsUpdated)
		});
	});

	router.route("/bookOwners/:selectedBook")
	.get(function(req, res) {
		users.find({"books": req.params.selectedBook}).toArray(function(err, owners) {
			for (var owner in owners) {
				delete owners[owner].password;
			}
			res.send(owners);
			res.end();
		})
	});
});

function isResponseReady(res, user1Updated, user2Updated, requestsUpdated) {
	if (user1Updated && user2Updated && requestsUpdated) {
		res.status(201);
		res.end();
	}
}

module.exports = router;