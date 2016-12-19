/* The list of states is needed to populate the select menu. */
var states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
$(document).ready(function() {
	/* When the "Edit info" button is clicked: */
	$("#edit").click(function() {
		/* changeLayout function is called with the string "update-info" to specify what the new layout should be. */
		changeLayout("update-info");
	});
	/* If the "Change Password" button is clicked, same function is ran but with the string "update-password". */
	$("#change-password").click(function() {
		changeLayout("update-password");
	});
});
/* This function modifies the layout of the page when the user needs to update information. */
function changeLayout(caller) {
	/* An if statement checks which layout is requested, the new layout is saved in newContent variable. */
	if (caller == "update-info") {
		/* Notice that the input fields will be populated with the current information. */
		var newContent = '<div class="container">' +
			"<form class='update-form' action='/profile/update' method='post'>" + 
			'<input type="hidden" name="_csrf" value=' + csrfToken + '>' +
			'<p class="info-header"><strong>Name:</strong></p>' + 
			'<input type="text" name="name" value="' + name + '">' + 
			'<p class="info-header"><strong>Address:</strong></p>' + 
			'<input type="text" name="address" value="' + address + '"><br/>' + 
			'<input type="text" name="city" value="' + city + '"><br/>' +
			'<select style="width: 228px; height:25px;" name="state" required></select><br/>' +
			'<input type="text" name="zip" value="' + zip + '"><br/>' + 
			'<button class="generic-button" type="submit">Submit</button>' + 
			'<button class="generic-button" id="cancel">Cancel</button>' + 
			'</form></div>';
	} else if (caller == "update-password") {
		var newContent = '<div class="container">' +
			"<form class='update-form' id='password-update-form' action='/profile/updatePassword' method='post'>" + 
			'<input type="hidden" name="_csrf" value=' + csrfToken + '>' +
			'<p class="info-header"><strong>New password:</strong><span style="font-size: 0.7em">(8 charachters minimum including a capital letter, number and a special character)</span></p>' + 
			'<input id="pass1" type="password" name="password1">' + 
			'<p class="info-header"><strong>Confirm new password:</strong></p>' + 
			'<input id="pass2" type="password" name="password2"><br/>' + 
			'<button class="generic-button" type="submit">Submit</button>' + 
			'<button class="generic-button" id="cancel">Cancel</button>' + 
			'</form></div>';
	}
	/* The div showing the user's information is slided. */
	$(".start").children().slideToggle(function() {
		/* The callback function resets the contents of start div. */
		$(".start").children().remove();
		/* The div is hidden temporarily. */
		$(".start").css({"display": "none"});
		/* The newContent is appended. */
		$(".start").append(newContent);
		/* If the user needs to update address, the current state is found and is automatically selected in the drop down menu, so the user doesn't need to select it again. */
		if (caller == "update-info") {
			for (var item in states) {
				if (states[item].toLowerCase() == state.toLowerCase()) {
					/* selected attribute is given to the current state. */
					$("select").append("<option class='state-option' value='" + states[item].toLowerCase() + "' selected>" + states[item] + "</option>");
				} else {
					$("select").append("<option class='state-option' value='" + states[item].toLowerCase() + "'>" + states[item] + "</option>");
				}
			}
		}
		/* The start div is now displayed. */
		$(".start").slideToggle();
		// The following two handlers should be here since they cannot be run before they are appended.
		$("#cancel").click(function(e) {
			e.preventDefault();
			location.reload();
		});	
		/* When the change passwor dorm is submitted. */
		$("#password-update-form").submit(function(e) {
			e.preventDefault();
			$(".error-message").remove();
			/* A variable to track whether an error has been found. */
			var errorFound = false;
			/* Check that password 1 has at least 8 characters. */
			if ($("#pass1").val().length < 8) {
				/* If less, error message prepended and errorFound set to true. */
				$("#password-update-form").prepend("<p class='error-message'>Password is not 8 or more characters.</p>");
				errorFound = true;
			/* Make sure that the password has a capital letter. */
			}else if (!$("#pass1").val().match(/[A-Z]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a capital letter.</p>");
				errorFound = true;
			/* Make sure the password has a number */
			}else if (!$("#pass1").val().match(/[0-9]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a number.</p>");
				errorFound = true;
			/* Make sure the password has a special character. */
			}else if (!$("#pass1").val().match(/[!@#$%^&*]/g)) {
				$("#password-update-form").prepend("<p class='error-message'>Password doesn't contain a special character.</p>");
				errorFound = true;
			/* Make sure both passwords match. */
			} else if ($("#pass1").val() !== $("#pass2").val()) {
				$("#password-update-form").prepend("<p class='error-message'>Passwords do not match.</p>");
				errorFound = true;
			}
			/* If errors are found, the form is submitted. */
			if (!errorFound) {
				e.target.submit();
			}
		});
	});
}