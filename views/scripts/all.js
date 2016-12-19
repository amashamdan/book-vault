$(document).ready(function() {
	/* 'More info' button click handler. */
	$(".dashboard-more-info").click(function() {
		/* The contents of the more-info div are removed to ensure that it is reset. */
		$(".more-info").children().remove();
		/* The clicked button's "input" sibling which has the isbn of the book is found and looked up in the allUsersBooks array. */
		for (var book in allUsersBooks) {
			if (allUsersBooks[book].isbn == $(this).siblings("input").attr("value")) {
				/* When the book is found, Its information are appended to more-info div. */
				$(".more-info").append('<div class="result">' + 
					'<input type="hidden" class="isbn" value=' + allUsersBooks[book].isbn + '>' +
					'<p class="book-title">' + allUsersBooks[book].title + '</p>' +
					//MUST USE FORM FOR csrfToken. When ajax uses post, server expects form data and hence csfrToken. Token passed in ajax post request below.
					'<div class="other-information">' + 
					'<div class="image-wrapper"><img class="result-image" src=' + allUsersBooks[book].image + '></div>' +
					'<div class="info-wrapper">' +
					'<p class="result-authors"><strong>Authors:</strong> <span>' + allUsersBooks[book].authors + '</span></p>' +
					'<p class="result-categotries"><strong>Categories:</strong> <span>' + allUsersBooks[book].categories + '</span></p>' +
					'<p class="result-pages"><strong>Pages:</strong> <span>' + allUsersBooks[book].pages + '</span></p>' +
					'<p class="result-description"><strong>Descrition:</strong> <span>' + allUsersBooks[book].description + '</span></p>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'<div style="text-align: center">' + 
					/* 'More info' button here is an external link of the book. */
					'<a href="' + allUsersBooks[book].link + '" target="blank"><button class="generic-button">More info</button></a>' +
					/* Close button */
					'<button class="cancel-button">Close</button></div>');
				/* The loop is broken when the book is found. */
				break;
			}
		}
		/* The function is called to create a click handler for the Close button. */
		cancelButtonClick();
		/* The div is slided down for the user to see. */
		$(".more-info").slideDown();
	});
	/* "Trade" button click handler. */
	$(".trade").click(function() {
		/* To do a trade, the user needs to have at least one book added. So a check is made to see ho many books are added by that user. */
		if (user.books.length == 0) {
			/* If the user has no books, more-info div contents are removed. */
			$(".more-info").children().remove();
			/* Error message with close button are appended. */
			$(".more-info").append('<div class="error-message-div"><p class="no-books-message">You dont\'t have any books in your vault! You need to have something to trade with! Add a book then you can make a trade.</p><button class="cancel-button">Close</button></div>');
			/* The error message is displayed. */
			$(".more-info").slideDown();
			/* Click handler for close button is created. */
			cancelButtonClick();
		/* If the user already owns at least one book: */
		} else {
			/* The book the user wants to request is saved... both isbn and title. Both are saved to simplify things on the server side. */
			var otherUserBookIsbn = $(this).siblings("input").attr("value");
			var otherUserBookTitle = $(this).siblings("p").html();
			/* more-info is reset. */
			$(".more-info").children().remove();
			/* A message asking the user to select a book (a book that the user owns) to trade is added. */
			$(".more-info").append('<button class="cancel-button">Cancel</button><div class="choice-books"><p style="width: 100%;">Which one of YOUR books you would like to trade?</p></div>');
			/* This array will temporarily store all users books. */
			var options = [];
			/* The isbns of the books the user owns are looked up in allUsersBooks to retrieve information about the user's books. */
			for (var book in user.books) {
				for (var item in allUsersBooks) {
					if (user.books[book] == allUsersBooks[item].isbn) {
						options.push(allUsersBooks[item]);
						/* The the book is found in allUsersBooks, A div is created for that book. */
						$(".choice-books").append(
							'<div class="book-choice">' +
							'<img src="' + allUsersBooks[item].image + '">' +
							'<input type="hidden" value="' + allUsersBooks[item].isbn + '">' +
							'<p>' + allUsersBooks[item].title +'</p></div>'
						);
					}
				}
			}
			/* Disable scrolling for the main page. */
			$("body").addClass("stop-scrolling");
			/* more-info is now displayed asking the user to select one of his/her books to trade. */
			$(".more-info").slideDown();
			/* Click handler fot the appended Cancel button is created. */
			cancelButtonClick();
			/* A click handler for book-choice. It is called when the user decides which of his/her books to trade. */
			$(".book-choice").click(function() {
				/* The book's title and isbn are saved. */
				var selectedBookIsbn = $(this).children("input").attr("value");
				var selectedBookTitle = $(this).children("p").html();
				/* more-info div now fades out. */
				$(".more-info").fadeOut();
				/* Ajax request sent to the server requesting a list of the owners of the book the user requested. */
				$.ajax({
					type: "GET",
					url: "/request/bookOwners/" + otherUserBookIsbn,
					success: function(owners) {
						/* Once the list of owners is received, showOwners function is called. */
						showOwners(owners, otherUserBookIsbn, otherUserBookTitle, selectedBookIsbn, selectedBookTitle)
					}
				});
			});
		}
	});
});
/* The function displays the owners of the requested book and continues the request process. */
function showOwners(owners, otherUserBookIsbn, otherUserBookTitle, selectedBookIsbn, selectedBookTitle) {
	$(".choice-books").children().remove();
	/* A message explaining the next step to the user is appended. */
	$(".choice-books").append('<p style="width: 100%;">The following Vaulters own the book you are requesting. Select the owner you want to trade with.</p>');
	/* A div is created for each owner and appended to choice-books. */
	for (var owner in owners) {
		$(".choice-books").append(
			'<div class="owner-choice">' +
			'<input type="hidden" value="' + owners[owner].email + '">' +
			'<p class="otherName">' + owners[owner].name + '</p>' +
			'<p>' + owners[owner].address + '</p>' +
			'<p>' + owners[owner].city + '</p>' +
			'<p>' + owners[owner].state +  '</p>' +
			'<p>' + owners[owner].zip +  '</p>' +
			'</div>');
	}
	/* The list of owners fades in. */
	$(".more-info").fadeIn();
	/* Click handler fir when an owner is selected. */
	$(".owner-choice").click(function() {
		/* The owner's name and email are saved. */
		var ownerEmail = $(this).children("input").attr("value");
		var ownerName = $(this).children(".otherName").html();
		/* Ajax POST request is sent to the server with all request's information. */
		$.ajax({
			url: "/request",
			type: "POST",
			data: {_csrf: csrfToken, ownerEmail: ownerEmail, ownerName: ownerName, otherUserBookIsbn: otherUserBookIsbn, otherUserBookTitle: otherUserBookTitle, selectedBookIsbn: selectedBookIsbn, selectedBookTitle: selectedBookTitle},
			statusCode: {
				/* Based on the status code received from server, a function is ran. */
				201: trade201,
				404: trade404
			}
		});
	})
}
/* This function creates a click handler for any button with class ".cancel-button". It is called several times because to create the handler, the button should be already existing. Buttons are not all added at once when the page is rendered, so after each button is appended, this function is called to create the handler. */
function cancelButtonClick() {
	$(".cancel-button").click(function() {
		$(".more-info").slideUp();
		/* Scrolling is restored. */
		$("body").removeClass("stop-scrolling");
	});
}
/* When the trade request is successful. */
function trade201() {
	$(".choice-books").children().remove();
	$(".more-info").children("button").remove();
	/* A success message is appended and displayed to the user. */
	$(".choice-books").append('<p style="width: 100%;">Your request has been placed successfully.</p>' +
		'<p style="width: 100%;">You can check your request status from the dashboard</p>' + 
		'<button class="cancel-button">Close</button>');
	cancelButtonClick();
}
/* When request is not complete, a message is alterted to the user and page is reloaded. */
function trade404() {
	alert("An error occured!");
	location.reload();
}