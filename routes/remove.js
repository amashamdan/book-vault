var express = require("express");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended: false});
var dotenv = require("dotenv");
dotenv.config();

var router = express.Router();
var MongoClient = mongodb.MongoClient;
var mongoUrl = process.env.BOOKS;

MongoClient.connect(mongoUrl, function(err, db){
	if (err) {
		// res.end("Failed to connect to database.");
	}
	var users = db.collection("users");
	var books = db.collection("shelf");
	var requests = db.collection("requests");
	/* Called when the user deleted a book from the dashboard page. */
	router.route("/")
	.post(parser, function(req, res) {
		/* Tracking variables. Track update of users, books and requests. */
		var userUpdated = false;
		var shelfUpdated = false;
		var requestsUpdated = false;
		/* user's object is updated. bookAdded decremented by one and the book's isbn is pulled from the books array */
		users.update(
			{"email": req.session.user.email},
			{"$inc": {"booksAdded": -1}, "$pull": {"books": req.body.isbn}},
			function() {
				/* After update, tracking variable set to true, deleteCompleted called to check of response is ready. */
				userUpdated = true;
				deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
			}
		);
		/* The book is looked up in the books collection. */
		books.find({"isbn": req.body.isbn}).toArray(function(err, result) {
			/* If the book has more than one owner: */
			if (result[0].owners.length > 1) {
				/* The user is puuled from the owners array. But the book is not removed from the books collection. */
				books.update(
					{"isbn": req.body.isbn},
					{"$pull": {"owners": req.session.user.email}},
					function() {
						/* Upon update, tracking variable set to ture and deleteCompleted is called. */
						shelfUpdated = true;
						deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
					}
				);
			} else {
				/* If the user is the only owner of the book, it is completely removed from the database. */
				books.remove({"isbn": req.body.isbn}, function() {
					shelfUpdated = true;
					deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
				});
			}
		});
		/* Requests collection stores data about history of requests. So we only need to modify pending requests. */
		requests.update(
			/* requests with requestedBook having the same isbn and with status Pening looked up. */
			{"requestedBook.isbn": req.body.isbn, "status": "Pending"},
			/* Status set to Unavailable. */
			{"$set": {"status": "Request unavailable*"}},
			function() {
			requests.update(
				/* requests with tradedBook having the same isbn and with status Pening looked up. */
				{"tradedBook.isbn": req.body.isbn, "status": "Pending"}, 
				{"$set": {"status": "Request unavailable*"}},
				function() {
					/* NOTE THAT EVEN IF NOTHING IS UPDATED, THIS FUNCTION WILL RUN AFTER DATABSE IS SEARCHED. */
					requestsUpdated = true;
					deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated);
				});
			}
		);
	});
});
/* The function uses tracking variables to check if database was completely updated. If so, reposne is sent. */
function deleteCompleted(res, userUpdated, shelfUpdated, requestsUpdated) {
	if (userUpdated && shelfUpdated && requestsUpdated) {
		res.status(201);
		res.end();
	}
}

module.exports = router;