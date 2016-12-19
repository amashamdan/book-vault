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
	/* Only these two collecitons needed. */
	var users = db.collection("users");
	var books = db.collection("shelf");

	router.route("/")
	.post(parser, function(req, res) {
		/* The user's data are looked up using the email: */
		users.find({"email": req.session.user.email}).toArray(function(err, result) {
			/* If the book is already found in the user's books, a response status 200 is sent to the client. */
			if (result[0].books.indexOf(req.body.book.isbn) > -1) {
				res.status(200);
				res.end();
			/* If the book is not found in the user's books: */
			} else {
				users.update(
					{"email": req.session.user.email},
					/* addToSet used as a fail safe to avoid duplication. The book's isbn only is added to the user's information. booksAdded is incremented by 1. */
					{"$addToSet": {"books": req.body.book.isbn}, "$inc": {"booksAdded": 1}},
					/* When update is over, the function adds the book to the books collection. All books information are added here. */
					function() {
						/* It is checked to see if the book is already is in the books collection. This happens if another user had already added the book. */
						books.find({"isbn": req.body.book.isbn}).toArray(function(err, result) {
							/* If the book is found, the current user's email is added to the owners list (each book has an owners list.) */
							if (result[0]) {
								books.update(
									{"isbn": req.body.book.isbn},
									{"$addToSet": {"owners": req.session.user.email}},
									function() {
										/* response is sent. */
										res.status(201);
										res.end();
									}
								);
							/* If the book is not found in books collection. It is added and then the response is sent. */
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
});

module.exports = router;