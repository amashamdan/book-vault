$(document).ready(function() {
	var position = $(window).height() - $(".footer").height();
	$(".footer").css({"position": "fixed", "top": position});
});