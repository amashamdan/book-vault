$(document).ready(function() {
	$("#edit").click(function() {
		$(".start").children().slideToggle(function() {
			$(".start").children().remove();
			$(".start").css({"display": "none"});
			$(".start").append(
				'<div class="container">' +
				"<form class='update-form' action='/update' method='post'>" + 
				'<input type="hidden" name="_csrf" value=' + csrfToken + '>' +
				'<p class="info-header"><strong>Name:</strong></p>' + 
				'<input type="text" name="name" value="' + name + '">' + 
				'<p class="info-header"><strong>Address:</strong></p>' + 
				'<input type="text" name="address" value="' + address + '"><br/>' + 
				'<input type="text" name="city" value="' + city + '"><br/>' +
				'<input type="text" name="state" value="' + state + '"><br/>' +
				'<input type="text" name="zip" value="' + zip + '"><br/>' + 
				'<button class="generic-button" type="submit">Submit</button>' + 
				'<button class="generic-button" id="cancel">Cancel</button>' + 
				'</form></div>'
				);
			$(".start").slideToggle();
			$("#cancel").click(function(e) {
				e.preventDefault();
				location.reload();
			});	
		});
	});
});