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
	var books = db.collection("shelf");

	router.route("/")
	.post(parser, function(req, res) {
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
});

module.exports = router;