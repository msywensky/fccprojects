class User {

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get isValid() {
		return this._valid;
	}

	set isValid(valid) {
		this._valid = valid;
	}

	get icon() {
		return this._icon;
	}

	set icon(icon) {
		this._icon = icon;
	}

	get streamUrl() {
		return this._streamUrl;
	}

	set streamUrl(streamUrl) {
		this._streamUrl = streamUrl;
	}

	get streamName() {
		return this._streamName;
	}
	set streamName(streamName) {
		this._streamName = streamName;
	}

	get isOnline() {
		return this._online;
	}

	set isOnline(online) {
		this._online = online;
	}

	get viewers() {
		return this._viewers;
	}

	set viewers(viewers) {
		this._viewers = viewers;
	}

	constructor(name) {
		this.name = name;
		this.icon = "";
		this.isOnline = false;
		this.streamName = "Offline";
		this.streamUrl = "";
		this.isValid = false;
		this.viewers = 0;
	 }
}

var users = [];
function loadUsers() {
	users = [];
	users.push(new User("InvalidUserXXx"));
	users.push(new User("ESL_SC2"));
	users.push(new User("cretetion"));
	users.push(new User("freecodecamp"));
	users.push(new User("storbeck"));
	users.push(new User("habathcx"));
	users.push(new User("RobotCaleb"));
	users.push(new User("noobs2ninjas"));
	users.push(new User("OgamingSC2"));

	return $.map(users,getUserInfo);
}

function loadStreams() {
	console.log("calling loadStreamms");
	var filtered = users.filter((item)=>item.isValid);
	console.log("Filtered len: " + filtered.length);
	return $.map(filtered,getStreamInfo);
}

function getUserInfo(user) {
	return $.getJSON('https://api.twitch.tv/kraken/users/' + user.name + '?callback=?', function(data) {
		console.log(data);
		if ( (data["status"] !== undefined) && (data["status"] === 404) ) {
			user.streamName = "User not found";

		} else {
			if (data["logo"]!== undefined) {
				user.icon = data.logo;
			}
			user.isValid = true;
		}

	}).promise();
}

function getStreamInfo(user) {
	console.log("getStreamInfoCalled:" + user.name);
	return $.getJSON('https://api.twitch.tv/kraken/streams/' + user.name + '?callback=?', function(data) {
		console.log(data);
		if ( (data["stream"]) && (data["stream"] != null) ) {
			user.streamUrl = data.stream.channel.url;
			user.isOnline = true;
			user.streamName = data.stream.game;
			user.viewers = data.stream.viewers;
		}
	}).promise();
}

function runTemplate() {
	$.Mustache.addFromDom('channel-template');
	$('#divResults').mustache('channel-template',{data:users});
}

function gotoStream(stream) {
	window.open(stream,"_blank");
}

function sortList() {
	users.sort((a,b)=>(b.isOnline - a.isOnline));
	console.log("sortList run");
}

$(document).ready( function () {
	$("#btnRunTemplate").on("click",runTemplate);
	var promises = loadUsers();
	$.when.apply(null, promises).then(function(data) {
		var promise2 = loadStreams();
		$.when.apply(null, promise2).then(()=>{sortList();console.log("done");runTemplate();});
	})
});