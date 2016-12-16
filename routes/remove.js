var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db){
	if (err) {
		res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var books = db.collection("shelf");
	var requests = db.collection("requests");
	router.route("/")
	.post(parser, function(req, res) {
		var userUpdated = false;
		var shelfUpdated = false;
		var requestsUpdated = false;

		users.update(
			{"email": req.session.user.email},
			{"$inc": {"booksAdded": -1}, "$pull": {"books": req.body.isbn}},
			function() {
				userUpdated = true;
				deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
			}
		);

		books.find({"isbn": req.body.isbn}).toArray(function(err, result) {
			if (result[0].owners.length > 1) {
				books.update(
					{"isbn": req.body.isbn},
					{"$pull": {"owners": req.session.user.email}},
					function() {
						shelfUpdated = true;
						deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
					}
				);
			} else {
				books.remove({"isbn": req.body.isbn}, function() {
					shelfUpdated = true;
					deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
				});
			}
		});

		requests.update(
			{"requestedBook.isbn": req.body.isbn, "status": "Pending"},
			{"$set": {"status": "Request unavailable*"}},
			function() {
			requests.update(
				{"tradedBook.isbn": req.body.isbn, "status": "Pending"}, 
				{"$set": {"status": "Request unavailable*"}},
				function() {
					requestsUpdated = true;
					deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
				});
			}
		);
	});
});

function deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated) {
	if (userUpdated && shelfUpdated && requestsUpdated) {
		res.status(201);
		res.end();
	}
}

module.exports = router;