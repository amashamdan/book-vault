$(document).ready(function() {
	$("#edit").click(function() {
		changeLayout("update-info");
	});

	$("#change-password").click(function() {
		changeLayout("update-password");
	});
});

function changeLayout(caller) {
	if (caller == "update-info") {
		var newContent = '<div class="container">' +
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
	} else if (caller == "update-password") {
		var newContent = '<div class="container">' +
			"<form class='update-form' id='password-update-form' action='/updatePassword' method='post'>" + 
			'<input type="hidden" name="_csrf" value=' + csrfToken + '>' +
			'<p class="info-header"><strong>New password:</strong><span style="font-size: 0.7em">(8 charachters minimum including a capital letter, number and a special character)</span></p>' + 
			'<input id="pass1" type="password" name="password1">' + 
			'<p class="info-header"><strong>Confirm new password:</strong></p>' + 
			'<input id="pass2" type="password" name="password2"><br/>' + 
			'<button class="generic-button" type="submit">Submit</button>' + 
			'<button class="generic-button" id="cancel">Cancel</button>' + 
			'</form></div>'
	}

	$(".start").children().slideToggle(function() {
		$(".start").children().remove();
		$(".start").css({"display": "none"});
		$(".start").append(newContent);
		$(".start").slideToggle();
		// The following two handlers should be here since they cannot be run before they are appended.
		$("#cancel").click(function(e) {
			e.preventDefault();
			location.reload();
		});	
		$("#password-update-form").submit(function(e) {
			e.preventDefault();
			$(".error-message").remove();
			var errorFound = false;
			if ($("#pass1").val().length < 8) {
				$("#password-update-form").prepend("<p class='error-message'>Password is not 8 or more characters.</p>");
				errorFound = true;
			}else if (!$("#pass1").val().match(/[A-Z]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a capital letter.</p>");
				errorFound = true;
			}else if (!$("#pass1").val().match(/[0-9]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a number.</p>");
				errorFound = true;
			}else if (!$("#pass1").val().match(/[!@#$%^&*]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a special character.</p>");
				errorFound = true;
			} else if ($("#pass1").val() !== $("#pass2").val()) {
				$("#password-update-form").prepend("<p class='error-message'>Passwords do not match.</p>");
				errorFound = true;
			}
			if (!errorFound) {
				e.target.submit();
			}
		});
	});
}