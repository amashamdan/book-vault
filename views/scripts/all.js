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
});