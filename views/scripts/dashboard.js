$(document).ready(function() {
	/* When the form to add a book is submitted: */
	$("#add-book-form").submit(function(e) {
		e.preventDefault();
		/* search-results div is reset. */
		$("#search-results").children().remove();
		/* A please wait message is appended and displayed to the user. */
		$("#search-results").append('<p class="wait-message">Please wait while we contact Google Books API.</p>')
		$("#search-results").fadeIn();
		/* The scrolling for the main page is disabled. */
		$("body").addClass("stop-scrolling");
		/* The google api link depends on whether an author is used or not. */
		if ($("#author").val() == "" || $("#author").val() == " ") {
			var link = "https://www.googleapis.com/books/v1/volumes?q=" + $("#title").val() + "&key=AIzaSyBozCv6XN30xQ6TiLYa3LJEbcUCZj8bTjg";
		} else {
			var link = "https://www.googleapis.com/books/v1/volumes?q=" + $("#title").val() + "+inauthor:" + $("#author").val() + "&key=AIzaSyBozCv6XN30xQ6TiLYa3LJEbcUCZj8bTjg";
		}
		/* Ajax request to google api to look up the book. */
		$.ajax({
			url: link,
			success: function(results) {
				/* showBooks function is run when results are received. */
				showBooks(results);
			},
			error: function(error) {
				/* an error is alerted if it occurs. */
				alert(error);
			}
		})
	});
	/* Handler to "Delete" button. When the user wants to delete a book. */
	$(".delete-book").click(function()	{
		/* The isbn of the book is found. */
		var isbn = $(this).siblings(".dashboard-book-isbn").attr("value");
		/* Post request initiated, data sent are isbn and csrf token. */
		$.ajax({
			url: "/remove",
			type: "POST",
			data: {_csrf: csrfToken, isbn: isbn},
			statusCode: {
				/* A function is run depending on the code received from the server. */
				201: request200,
				404: add404 
			}
		})
	})
	/* A handler to the buttons "Cancel request", "Approve" and "Decline" buttons. */
	$(".request-action").click(function() {
		/* The requestID and other user's email are saved, needed by the server. */
		var requestID = $(this).siblings("#requestID").attr("value");
		var otherUser = $(this).siblings("#otherUser").attr("value");
		/* A confirm message is alerted to the user. The message depends on the action selected by the user. */
		if (confirm("Are you sure you want to " + $(this).attr("value") + " the request?")) {
			/* Post request to the server to modify database according to the selected action. */
			$.ajax({
				url: "/action/" + $(this).attr("value"),
				type: "POST",
				data: {"_csrf": csrfToken, "requestID": requestID, "otherUser": otherUser},
				statusCode: {
					200: request200,
					404: add404
				}
			});
		}
	});
	/* When the [User] address button is clicked: */
	$(".address-button").click(function() {
		/* address-div is reset to remove any previous address. */
		$(".address-div").children().remove();
		/* The other user's email is saved. */
		var otherUser = $(this).siblings("#otherUser").attr("value");
		/* Post request to the server requesting the other user's information. */
		$.ajax({
			url: "/dashboard/user/" + otherUser,
			type: "GET",
			success: function(data) {
				/* When the user's address is received, it is appended to address-div. */
				$(".address-div").append(
					'<p>' + data.address + '</p>' +
					'<p>' + data.city + ', ' + data.state + ' ' + + data.zip + '</p>' +
					'<button class="cancel-button" id="address-close">Close</button>'
				);
				/* The address is shown. */
				$(".address-div").slideDown();
				/* Click handler for the close button is created. */
				$("#address-close").click(function() {
					$(".address-div").slideUp();
				})
			},
			error: function(err) {
				alert(err);
			}
		})
	});
});
/* This functino is called when the results from Google Books api are received. It extracts the needed data from the results and displays them. */
function showBooks(results) {
	/* If no results are found in Google's database, a message is alerted and the serch-results div fades out. */
	if (results.totalItems == 0) {
		alert("No results found.");
		$("#search-results").fadeOut();
	/* If the search returns result. */
	} else {
		/* the div is reset. */
		$("#search-results").children().remove();
		/* A maximum number of 10 results is to be displaye. The number of results is checked, if less than 10 the limit os set to the number of results. If the results are more than 10, the limit is set to ten. */
		if (results.items.length < 10) {
			var limit = results.items.length;
		} else {
			var limit = 10;
		}
		/* The results are looped through (up until limit is reached.) */
		for (var i = 0; i < limit; i++) {
			/* Information are extracted. */
			var title = results.items[i].volumeInfo.title;
			/* If a subtitle exists, it is added to the title. */
			if (results.items[i].volumeInfo.subtitle) {
				title = title + ": " + results.items[i].volumeInfo.subtitle;
			}
			var authors = results.items[i].volumeInfo.authors;
			var link = results.items[i].volumeInfo.canonicalVolumeLink;
			var categories = results.items[i].volumeInfo.categories;
			var description = results.items[i].volumeInfo.description;
			var image = results.items[i].volumeInfo.imageLinks.thumbnail;
			var pages = results.items[i].volumeInfo.pageCount;
			/* Each book should have an isbn which is saved. */
			if (results.items[i].volumeInfo.industryIdentifiers) {
				var isbn = results.items[i].volumeInfo.industryIdentifiers[0].identifier;
			} else {
				/* If the book ddoesn't have an isbn, continue will skip the remainder of this loop and hence that book is not appended. */
				continue
			}
			/* If the book has an isbn, it is appedned to search-results. */
			$("#search-results").append('<div class="result">' + 
				'<input type="hidden" class="isbn" value=' + isbn + '>' +
				'<p class="book-title">' + title + '</p>' +
				//MUST USE FORM FOR csrfToken. When ajax uses post, server expects form data and hence csfrToken. Token passed in ajax post request below.
				'<form class="addition" method="post" action="/addbook"><button type="submit" class="add-this-book">Add this book</button><a href=' + link + ' target="blank"><button class="generic-button more-info-button">More info</button></a><button class="cancel-button">Cancel</button></form>' +
				'<div class="other-information">' + 
				'<div class="image-wrapper"><img class="result-image" src=' + image + '></div>' +
				'<div class="info-wrapper">' +
				'<p class="result-authors"><strong>Authors:</strong> <span>' + authors + '</span></p>' +
				'<p class="result-categotries"><strong>Categories:</strong> <span>' + categories + '</span></p>' +
				'<p class="result-pages"><strong>Pages:</strong> <span>' + pages + '</span></p>' +
				'<p class="result-description"><strong>Description:</strong> <span>' + description + '</span></p>' +
				'</div>' +
				'</div>' +
				'</div><hr/>');
		}
		/* Click handler for  cancel button. */
		$(".cancel-button").click(function(e) {
			/* Prevent default needed because this button is a child to the form. */
			e.preventDefault();
			$("#search-results").fadeOut();
			$("#search-results").children().remove();
			/* Scrolling for main page is restored. */
			$("body").removeClass("stop-scrolling");
		});
		/* When 'More info' is clicked, the link is opened in a new page. */
		$(".more-info").click(function(e) {
			/* Prevent default needed because this button is a child to the form. */
			e.preventDefault();
			var link = $(this).parent().attr("href");
			window.open(link, "_blank")
		});
		/* When the "Add this book is clicked", the form is submitted. */
		$(".addition").submit(function(e) {
			e.preventDefault();
			/* A book object is created to be sent to the server. */
			var book = {
				"title": $(this).siblings(".book-title").html(),
				"link": $(this).children("a").attr("href"),
				"image": $(this).siblings(".other-information").children(".image-wrapper").children("img").attr("src"),
				"authors": $(this).siblings(".other-information").children(".info-wrapper").children(".result-authors").children("span").html(),
				"categories": $(this).siblings(".other-information").children(".info-wrapper").children(".result-categotries").children("span").html(),
				"pages": $(this).siblings(".other-information").children(".info-wrapper").children(".result-pages").children("span").html(),
				"description": $(this).siblings(".other-information").children(".info-wrapper").children(".result-description").children("span").html(),
				"isbn": $(this).siblings(".isbn").attr("value")
			}
			/* Ajax request to save the book in the database. */
			$.ajax({
				url: "/addbook",
				type: "POST",
				data: {_csrf: csrfToken, book: book},
				statusCode: {
					200: add200,
					201: add201,
					404: add404
				}
			});
		});
	}
}

function add200() {
	alert("Book is already added... Wake up my friend!");	
}

function add201() {
	alert("Book added successfully");
	location.reload();
}


function add404() {
	alert("An error occured.");
}

function request200() {
	location.reload();
}
