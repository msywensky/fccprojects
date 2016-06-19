var lat=0;
var long=0;

var temp=0;
var tempFeelsLike=0;
var degree="F";
var weather="";
var weatherdesc="";
var weathericon="";
var skycons;

$(document).ready( function () {

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			lat = position.coords.latitude;
			long = position.coords.longitude;
			console.log("lat:",lat," long:",long);
			//$("#data").html("latitude: " + lat + "<br/>longitude: " + long);
	  		getWeather(lat, long);
		});
	}
	
	$("#temp").on("click",function(e) {
		if (degree == "C") {
			temp =  Math.round(temp * 9 / 5 + 32);
			tempFeelsLike =  Math.round(tempFeelsLike * 9 / 5 + 32);
			degree = "F";
		} else	{
			temp =  Math.round( (temp -32) * 5 / 9);
			tempFeelsLike =  Math.round( (tempFeelsLike -32) * 5 / 9);
			degree = "C";
		}	
		$("#temp").html(temp + "&deg;" + degree);
		$("#tempFeelsLike").html(tempFeelsLike + "&deg;" + degree);
	});
});


function UpdateUI() {
	$("#temp").html(temp + "&deg;" + degree);
	$("#tempFeelsLike").html(tempFeelsLike + "&deg;" + degree);
	$("#weather").text(weather);
	//$("#weatherIcon").attr("src",weathericon);
	console.log("desc: " + weatherdesc);

	if (weatherdesc.contains("night")) {
		skycons = new Skycons({"color": "white"});
		$("body").addClass("dark");
		if (weatherdesc.contains("rain") || weatherdesc.contains("sleet") ) {
			$("body").addClass("rainy-night");
		} else if( weatherdesc.contains("cloud")) {
			$("body").addClass("cloudy-night");
		} else {
			$("body").addClass("clear-night");
		}	

	} else {
		skycons = new Skycons({"color": "black"});
		if (weatherdesc.contains("rain") || weatherdesc.contains("sleet") ) {
			$("body").addClass("rainy");
		} else if( weatherdesc.contains("cloud")) {
			$("body").addClass("cloudy");
		} else if( weatherdesc.contains("sun")) {
			$("body").addClass("sunny");
		} else {
			$("body").addClass("clear");
		}	
	}
	skycons.add("icon1",weatherdesc);
}

String.prototype.contains = function(str) {
	return this.toLowerCase().indexOf(str.toLowerCase()) != -1;
}



function getWeather(lat, lon) {
	var url = "https://api.forecast.io/forecast/8570e3706f2dfd0855b5a33a7e1a96c4/" + lat + "," + lon;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data) {
			console.log(data);
			var d = data.currently;
			//city = data.name;
			//country = data.sys.country;
			temp = Math.round(d.temperature);
			tempFeelsLike = Math.round(d.apparentTemperature);
			weather = d.summary;

			//clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, or partly-cloudy-night
			weatherdesc = d.icon; 

			//weathericon = "//openweathermap.org/img/w/" + data.weather[0].icon + ".png";
			UpdateUI();
		}
	});

}