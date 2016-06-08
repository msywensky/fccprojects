var dogBarkingBuffer = null;
// Fix up prefixing
var context = null;

function loadDogSound(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      dogBarkingBuffer = buffer;
    }, onError);
  }
  request.send();
}

function onError(e) {
	console.log(e);
}

function playIt() {
	playSound(dogBarkingBuffer);
}

function playSound(buffer) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = buffer;                    // tell the source which sound to play
  source.connect(context.destination);       // connect the source to the context's destination (the speakers)
  source.start(0);                           // play the source now
  source.loop = true;								
}


function startSound(buffer) {
	var source = context.createBufferSource(); // creates a sound source
	source.buffer = buffer;                    // tell the source which sound to play
	source.connect(context.destination);       // connect the source to the context's destination (the speakers)
	source.start(0);                           // play the source now
												// note: on older systems, may have to use deprecated noteOn(time);
	source.loop	= true;
}

function stopSound() {
	
}

function generateSound() {
	console.log("sound generated 1");
	var oscillator = context.createOscillator();

	oscillator.type = 'square';
	oscillator.frequency.value = 415; // value in hertz
	oscillator.connect(context.destination);
	oscillator.start(0);	
	console.log("sound generated 2");
}



$(document).ready( function () {
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		context = new AudioContext();
	} catch(e) {
		alert('Web Audio API is not supported in this browser');
	}
  
//	loadDogSound("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3");
	loadDogSound("http://127.0.0.1:8080/simonSound1.mp3");
	$("#btnPlay").on("click",playIt);
	$("#btnStart").on("click",startSound);
	$("#btnStop").on("click",stopSound);
	$("#btnGenerate").on("click",generateSound);
	
});
