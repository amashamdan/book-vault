$(document).ready(function() {
	$("#add-book-form").submit(function(e) {
		e.preventDefault();
		$("#search-results").children().remove();
		$("#search-results").append('<p class="wait-message">Please wait while we contact Google Books API.</p>')
		$("#search-results").fadeIn();
		$("body").addClass("stop-scrolling");
		if ($("#author").val() == "" || $("#author").val() == " ") {
			var link = "https://www.googleapis.com/books/v1/volumes?q=" + $("#title").val() + "&key=AIzaSyBozCv6XN30xQ6TiLYa3LJEbcUCZj8bTjg";
		} else {
			var link = "https://www.googleapis.com/books/v1/volumes?q=" + $("#title").val() + "+inauthor:" + $("#author").val() + "&key=AIzaSyBozCv6XN30xQ6TiLYa3LJEbcUCZj8bTjg";
		}

		$.ajax({
			url: link,
			success: function(results) {
				if (results.totalItems == 0) {
					alert("No results found.");
					$("#search-results").fadeOut();
				} else {
					$("#search-results").children().remove();
					if (results.items.length < 10) {
						var limit = results.items.length;
					} else {
						var limit = 10;
					}
					for (var i = 0; i < limit; i++) {
						var title = results.items[i].volumeInfo.title;
						if (results.items[i].volumeInfo.subtitle) {
							title = title + ": " + results.items[i].volumeInfo.subtitle;
						}
						var authors = results.items[i].volumeInfo.authors;
						var link = results.items[i].volumeInfo.canonicalVolumeLink;
						var categories = results.items[i].volumeInfo.categories;
						var description = results.items[i].volumeInfo.description;
						var image = results.items[i].volumeInfo.imageLinks.thumbnail;
						var pages = results.items[i].volumeInfo.pageCount;
						if (results.items[i].volumeInfo.industryIdentifiers) {
							var isbn = results.items[i].volumeInfo.industryIdentifiers[0].identifier;
						} else {
							continue
						}
						
						$("#search-results").append('<div class="result">' + 
							'<input type="hidden" class="isbn" value=' + isbn + '>' +
							'<p class="book-title">' + title + '</p>' +
							//MUST USE FORM FOR csrfToken. When ajax uses post, server expects form data and hence csfrToken. Token passed in ajax post request below.
							'<form class="addition" method="post" action="/addbook"><button type="submit" class="add-this-book">Add this book</button><a href=' + link + ' target="blank"><button class="generic-button more-info">More info</button></a><button class="cancel-button">Cancel</button></form>' +
							'<div class="other-information">' + 
							'<div class="image-wrapper"><img class="result-image" src=' + image + '></div>' +
							'<div class="info-wrapper">' +
							'<p class="result-authors"><strong>Authors:</strong> <span>' + authors + '</span></p>' +
							'<p class="result-categotries"><strong>Categories:</strong> <span>' + categories + '</span></p>' +
							'<p class="result-pages"><strong>Pages:</strong> <span>' + pages + '</span></p>' +
							'<p class="result-description"><strong>Descrition:</strong> <span>' + description + '</span></p>' +
							'</div>' +
							'</div>' +
							'</div><hr/>');
					}

					$(".cancel-button").click(function(e) {
						e.preventDefault();
						$("#search-results").fadeOut();
						$("#search-results").children().remove();
						$("body").removeClass("stop-scrolling");
					});

					$(".more-info").click(function(e) {
						e.preventDefault();
						var link = $(this).parent().attr("href");
						window.open(link, "_blank")
					});

					$(".addition").submit(function(e) {
						e.preventDefault();
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
			},
			error: function(error) {
				alert(error);
			}
		})
	});

	$(".delete-book").click(function()	{
		var isbn = $(this).siblings(".dashboard-book-isbn").attr("value");
		$.ajax({
			url: "/remove",
			type: "POST",
			data: {_csrf: csrfToken, isbn: isbn},
			statusCode: {
				201: delete201,
				404: add404 
			}
		})
	})

	$(".cancel-request").click(function() {
		var requestID = $(this).siblings("#requestID").attr("value");
		var otherUser = $(this).siblings("#otherUser").attr("value");
		if (confirm("Are you sure you want to cancel the request?")) {
			$.ajax({
				url: "/cancel-request",
				type: "POST",
				data: {"_csrf": csrfToken, "requestID": requestID, "otherUser": otherUser},
				statusCode: {
					200: delete201,
					404: add404
				}
			});
		}
	});
});

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

function delete201() {
	location.reload();
}
