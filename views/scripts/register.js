var states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

$(document).ready(function() {
	/* States are appedned to the select menu. */
	for (var state in states) {
		$("select").append("<option class='state-option' value='" + states[state].toLowerCase() + "'>" + states[state] + "</option>");
	}
	/* When the form is submitted: */
	$(".register-form").submit(function(e) {
		e.preventDefault();
		$(".error-message").remove();
		/* To track if an error is found or not. */
		var errorFound = false;
		/* Ensure that the zip code is numeric and has 5 digits. */
		if (!$.isNumeric($("#zip-code").val()) || ($("#zip-code").val() > 99999) || ($("#zip-code").val() < 10000)) {
			/* If the zip code is invalid, an error message is prepended and errorFound set to true. */
			$(".register-form").prepend("<p class='error-message'>Please enter a valid zip code.</p>");
			errorFound = true;
		}
		/* Check that password 1 has at least 8 characters. */
		if ($("#pass1").val().length < 8) {
			$(".register-form").prepend("<p class='error-message'>Password is not 8 or more characters.</p>");
			errorFound = true;
		/* Make sure that the password has a capital letter. */
		}else if (!$("#pass1").val().match(/[A-Z]/g)) {
			$(".register-form").prepend("<p class='error-message'>Password doesn't contain a capital letter.</p>");
			errorFound = true;
		/* Make sure the password has a number */
		}else if (!$("#pass1").val().match(/[0-9]/g)) {
			$(".register-form").prepend("<p class='error-message'>Password doesn't contain a number.</p>");
			errorFound = true;
		/* Make sure the password has a special character. */
		}else if (!$("#pass1").val().match(/[!@#$%^&*]/g)) {
			$(".register-form").prepend("<p class='error-message'>Password doesn't contain a special character.</p>");
			errorFound = true;
		/* Make sure both passwords match. */
		} else if ($("#pass1").val() !== $("#pass2").val()) {
			$(".register-form").prepend("<p class='error-message'>Passwords do not match.</p>");
			errorFound = true;
		}

		if (!isValidEmailAddress($("#email").val())) {
			$(".register-form").prepend("<p class='error-message'>Please enter a valid email.</p>");
			errorFound = true;
		}
		/* If errors are found, the form is submitted. */
		if (!errorFound) {
			e.target.submit();
		}
	});
});

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
}