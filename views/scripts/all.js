$(document).ready(function() {
	$(".dashboard-more-info").click(function() {
		$(".more-info").children().remove();
		for (var book in allUsersBooks) {
			if (allUsersBooks[book].title == $(this).siblings("p").html()) {
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
					'<a href="' + allUsersBooks[book].link + '" target="blank"><button class="generic-button">More info</button></a>' + 
					'<button class="cancel-button">Close</button></div>');
				break;
			}
		}
		$(".cancel-button").click(function() {
			$(".more-info").slideUp();
		});

		$(".more-info").slideDown();
	});

	$(".trade").click(function() {
		if (user.books.length == 0) {
			$(".more-info").children().remove();
			$(".more-info").append('<div class="error-message-div"><p class="no-books-message">You dont\'t have any books in your vault! You need to have something to trade with! Add a book then you can make a trade.</p><button class="cancel-button">Close</button></div>');

			$(".more-info").slideDown();
			$(".cancel-button").click(function() {
				$(".more-info").slideUp();
			});
		} else {
			var otherUserBookIsbn = $(this).siblings("input").attr("value");
			var otherUserBookTitle = $(this).siblings("p").html();
			$(".more-info").children().remove();
			$(".more-info").append('<button class="cancel-button">Cancel</button><div class="choice-books"><p style="width: 100%;">Which one of YOUR books you would like to trade?</p></div>');
			var options = [];
			for (var book in user.books) {
				for (var item in allUsersBooks) {
					if (user.books[book] == allUsersBooks[item].isbn) {
						options.push(allUsersBooks[item]);
						$(".choice-books").append(
							'<div class="book-choice">' +
							'<img src="' + allUsersBooks[item].image + '">' +
							'<input type="hidden" value="' + allUsersBooks[item].isbn + '">' +
							'<p>' + allUsersBooks[item].title +'</p></div>'
						);
					}
				}
			}
			$("body").addClass("stop-scrolling");
			$(".more-info").slideDown();
			$(".cancel-button").click(function() {
				$(".more-info").slideUp();
				$("body").removeClass("stop-scrolling");
			});
			$(".book-choice").click(function() {
				var selectedBookIsbn = $(this).children("input").attr("value");
				var selectedBookTitle = $(this).children("p").html();
				$(".more-info").fadeOut();
				$.ajax({
					type: "GET",
					url: "/bookOwners/" + otherUserBookIsbn,
					success: function(owners) {
						$(".choice-books").children().remove();
						$(".choice-books").append('<p>The following Vaulters own the book you are requesting. Select the owner you want to trade with.</p>');
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
						$(".more-info").fadeIn();
						$(".owner-choice").click(function() {
							var ownerEmail = $(this).children("input").attr("value");
							var ownerName = $(this).children(".otherName").html();

							$.ajax({
								url: "/request",
								type: "POST",
								data: {_csrf: csrfToken, ownerEmail: ownerEmail, ownerName: ownerName, otherUserBookIsbn: otherUserBookIsbn, otherUserBookTitle: otherUserBookTitle, selectedBookIsbn: selectedBookIsbn, selectedBookTitle: selectedBookTitle},
								statusCode: {
									201: trade201,
									404: trade404
								}
							});
						})
					}
				});
			});
		}
	});
});

function trade201() {
	$(".choice-books").children().remove();
	$(".more-info").children("button").remove();
	$(".choice-books").append('<p style="width: 100%;">Your request has been placed successfully.</p>' +
		'<p style="width: 100%;">You can check your request status from the dashboard</p>' + 
		'<button class="cancel-button">Close</button>');
	$(".cancel-button").click(function() {
		$(".more-info").slideUp();
	});
	$("body").removeClass("stop-scrolling");
}

function trade404() {
	alert("An error occured!");
	location.reload();
}