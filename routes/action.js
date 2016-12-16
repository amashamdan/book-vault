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
	router.route("/action/:type")
	.post(parser, function(req, res) {
		if (req.params.type == "cancel") {
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
		} else if (req.params.type == "approve" || req.params.type == "decline") {
			var status = req.params.type.replace(/[a-z]/, function(match) {
				return match.toUpperCase();
			});
			status += "d";
			requests.update(
				{"requestID": req.body.requestID},
				{"$set": {"status": status}},
				function() {
					res.status(200);
					res.end();
				}
			);
		}
	});
});

module.exports = router;