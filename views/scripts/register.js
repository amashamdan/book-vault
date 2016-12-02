var states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

$(document).ready(function() {
	var position = $(window).height() - $(".footer").height();
	var height = $(window).height() - 2 * $(".footer").height() - 2*$(".menu").height();
	$(".footer").css({"position": "fixed", "top": position});
	$(".start").css({"max-height": height});
	//$(".start").css({"margin-bottom": $(".footer").height(), "position": "relative", "z-index": "5"});

	for (var state in states) {
		$("select").append("<option class='state-option' value='" + states[state].toLowerCase() + "'>" + states[state] + "</option>");
	}

	$(".register-form").submit(function(e) {
		e.preventDefault();
		$(".error-message").remove();
		var errorFound = false;

		if (!$.isNumeric($("#zip-code").val()) || ($("#zip-code").val() > 99999) || ($("#zip-code").val() < 10000)) {
			$(".register-form").prepend("<p class='error-message'>Please enter a valid zip code.</p>");
			errorFound = true;
		}

		if ($("#pass1").val() !== $("#pass2").val()) {
			$(".register-form").prepend("<p class='error-message'>Passwords do not match.</p>");
			errorFound = true;
		}

		if (emails.indexOf($("#email").val()) >= 0) {
			$(".register-form").prepend("<p class='error-message'>Email is already registered.</p>");
			errorFound = true;
		}

		if (!isValidEmailAddress($("#email").val())) {
			$(".register-form").prepend("<p class='error-message'>Please enter a valid email.</p>");
			errorFound = true;
		}

		if (!errorFound) {
			e.target.submit();
		}
	});
});

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
}