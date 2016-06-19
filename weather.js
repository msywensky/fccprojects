/// <reference path="jquery.d.ts" />

var lat=0;
var long=0;

var temp=0;
var degree="F";
var city="";
var country="";
var weather="";
var weatherdesc="";
var weathericon="";
$(document).ready( function () {

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			lat = position.coords.latitude;
			long = position.coords.longitude;
			console.log("lat:",lat," long:",long);
			//$("#data").html("latitude: " + lat + "<br/>longitude: " + long);
	  		getWeather();
		});
	}
	
	$("#temp").on("click",function(e) {
		if (degree == "C") {
			temp =  Math.round(temp * 9 / 5 + 32);
			degree = "F";
		} else	{
			temp =  Math.round( (temp -32) * 5 / 9);
			degree = "C";
		}	
		$("#temp").html(temp + "&deg;" + degree);
	});
});


function UpdateUI() {
	console.log(city,temp,weather,weatherdesc);
	$("#temp").html(temp + "&deg;" + degree);
	$("#city").text(city + ", " + country);
	$("#weather").text(weather);
	$("#weatherIcon").attr("src",weathericon);
	console.log("desc: " + weatherdesc);
	if (weatherdesc.contains("rain") || weatherdesc.contains("thunder") ) {
		$("body").addClass("rainy");
	} else if( weatherdesc.contains("cloud")) {
		$("body").addClass("cloudy");
	} else if( weatherdesc.contains("sun")) {
		$("body").addClass("sunny");
	} else {
		$("body").addClass("clear");
	}	
}

String.prototype.contains = function(str) {
	return this.toLowerCase().indexOf(str.toLowerCase()) != -1;
}

function getWeather() {
	var key = "34b59da051c6ac1dba34c4dcbb657c8f";
	var url = "//api.openweathermap.org/data/2.5/weather?lat=" + lat 
	+ "&lon=" + long + "&units=imperial&APPID=" + key;
	console.log("url:",url);
	$.getJSON(url)
	.done(function(data) {
		city = data.name;
		country = data.sys.country;
		temp = Math.round(data.main.temp);
		weather = data.weather[0].main;
		weatherdesc = data.weather[0].description;
		weathericon = "//openweathermap.org/img/w/" + data.weather[0].icon + ".png";
		UpdateUI();
		console.log(JSON.stringify(data));
	});
}

