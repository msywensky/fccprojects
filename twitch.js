

function getListOfStreams() {

	var channels = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", 
	"storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];

	$.ajax({
		url: "https://api.twitch.tv/kraken/streams",
	
		// The name of the callback parameter, as specified by the YQL service
		jsonp: "callback",
	
		// Tell jQuery we're expecting JSONP
		dataType: "jsonp",
	
		// Tell YQL what we want and that we want JSON
		data: {
			channel: channels.join(",")
		},
	
		// Work with the response
		success: function( response ) {
			$("#divResults").text(response);
			console.log( response ); // server response
		}
	});
}

function getChannelData(channel) {
	$.getJSON('https://api.twitch.tv/kraken/streams/' + channel + '?callback=?', function(data) {
		console.log(data);
	});
}

function getChD() {
	var data = $("#txtData").val();
	console.log(data);
	getChannelData(data);
}

$(document).ready( function () {
	$("#btnTest").on("click",getListOfStreams);
	$("#btnGetDetail").on("click", getChD);
});