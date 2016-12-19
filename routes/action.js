var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
/* Creating express router instance. */
var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;
/* Establish connection to mongodb. */
MongoClient.connect(mongoUrl, function(err, db) {
	if (err) {
		res.end("Failed to connect to database.");
	}
	/* This is called when the user wants to cancel, approve or decline a request. */
	var users = db.collection("users");
	var requests = db.collection("requests");
	router.route("/:type")
	.post(parser, function(req, res) {
		/* If the user wants to cancel a request. */
		if (req.params.type == "cancel") {
			/* These three variables tracks the changes that need to be updated before response is sent. All need to be true for the response to be sent. */
			var user1Updated = false;
			var user2Updated = false;
			var requestsUpdated = false;
			/* Look up first user: */
			users.update(
				/* use email since it's unique for each user. */ 
				{"email": req.session.user.email},
				/* Use the requestID to remove the request from outgoingRequests. PAY ATTENTION THAT 'Cancel Request' ONLY APPEARS IN THE OUTGOING REQUESTS SECTION IN THE DASHBOARD, THAT'S WHY THE REQUEST IS LOOKED UP IN THE OUTGOING REQUESTS OF THE LOGGED IN USER. */
				{"$pull": {"outgoingRequests": req.body.requestID}},
				function() {
					/* The first tracking variable is set to true. */
					user1Updated = true;
					/* Since using database is asynchronous, things don't happen in order. Other tracking variables are checked and if all is true, response is sent. */
					if (user1Updated && user2Updated && requestsUpdated) {
						res.status(200);
						res.end();
					}
				}
			);

			/* Update other user. This user will have the requestID in the incomingRequests object. The rest is similar to the above. */
			users.update(
				{"email": req.body.otherUser},
				{"$pull": {"incomingRequests": req.body.requestID}},
				function() {
					user2Updated = true;
					if (user1Updated && user2Updated && requestsUpdated) {
						res.status(200);
						res.end();
					}
				}
			);
			/* requests collection now updated. The request is looked up by its ID and removed from the collection. */
			requests.remove({"requestID": req.body.requestID}, function() {
				/* tracking variable set to true and then it is checked to see if the response is ready to be sent. */
				requestsUpdated = true;
				if (user1Updated && user2Updated && requestsUpdated) {
					res.status(200);
					res.end();
				}
			})
		/* If the user wants to approive or decline a request. */
		} else if (req.params.type == "approve" || req.params.type == "decline") {
			/* The action type is capitalized and letter 'd' is appended. */
			var status = req.params.type.replace(/[a-z]/, function(match) {
				return match.toUpperCase();
			});
			status += "d";
			/* The request is looked up, status is changed and then response is sent. */
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
/* Specufiying the output of this module. */
module.exports = router;