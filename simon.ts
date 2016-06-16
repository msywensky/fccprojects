
//I know this is bad, tsk, tsk
let wrongSound: HTMLAudioElement;

class ColorButton {
	
	offColor:string;
	onColor:string;
	sound:HTMLAudioElement;
	element:JQuery;
	
	constructor( offColor:string,  onColor:string,  sound:HTMLAudioElement,  element:JQuery) {
		this.offColor = offColor;
		this.onColor = onColor;
		this.sound = sound;
		this.sound.loop = true;
		this.element = element;
	}
	
	turnOn() {
		console.log("turning on " + this.onColor);
		this.element.addClass("on");
		//this.element.css({ fill:this.onColor});
		this.sound.play();
	}

	turnLightOn() {
		this.element.addClass("on");
	}

	turnLightOff() {
		this.element.removeClass("on");
	}
	
	turnOnInvalid() {
		this.element.addClass("on");
		console.log("Playing invalid sound");
	/*	if ( (!wrongSound.paused) || (wrongSound.currentTime > 0) ){
			return;
		} */
		wrongSound.addEventListener("ended",() => this.turnOffInvalid());
		wrongSound.play();
		
	}
	
	turnOff() {
		console.log("turning off " + this.offColor);
		this.element.removeClass("on");
		this.sound.pause();
		this.sound.currentTime = 0;
	}
	
	turnOffInvalid() {
		this.element.removeClass("on");
		wrongSound.removeEventListener("ended", () => this.turnOffInvalid());
	}
	
}

enum GameStateEnum {
    OFF,
    ON,
    PLAYING_SEQUENCE,
    ENTERING_SEQUENCE,
	ADD_TO_SEQUENCE,
	AWAITING_RESTART,
	AWAITING_PLAYING_SEQUENCE,
	WON
}

class Simon {
	
	GameState: GameStateEnum;
	
	tSequence : Array<ColorButton>;
	Sequence : Array<ColorButton>;
	EnteredSeqCorrect : number;
	StrictEnabled : boolean;
	ActiveTimeout: number;
	WinningSeqCount: number;
	
	AvailableColors: Array<ColorButton>;
	
	constructor() {
		this.GameState = GameStateEnum.OFF;
		this.Sequence = [];
		this.EnteredSeqCorrect = 0;
		this.StrictEnabled = false;
		this.AvailableColors = [];
		this.WinningSeqCount = 20; //Lower for testing
		console.log("constructor being called.  GameState:" + this.GameState);
	}

	addColor(color:ColorButton) {
		this.AvailableColors.push(color);
		let self=this;
		color.element.on("mousedown touchstart", ()=>self.colorButtonDown(color) );
		//color.element.on("mousemove", ()=>self.colorButtonUp(color) );
		color.element.on("mouseup touchend", ()=>self.colorButtonUp(color) );
		//color.element.mousedown(  ()=>self.colorButtonDown(color) );
		//color.element.mouseup(  ()=>self.colorButtonUp(color) );
	}

	togglePower(btn:JQuery, txt:JQuery) {
		console.log("toggle power clicked");
		console.log("game state = " + this.GameState);
		if (this.GameState === GameStateEnum.OFF) {
			this.GameState = GameStateEnum.ON;
			btn.addClass("on");
			txt.text("On");
			console.log("turning on");
			this.updateMoveCount("- -");
		} else {
			btn.removeClass("on");
			this.Sequence = [];
			this.GameState = GameStateEnum.OFF;
			console.log("turning off");
			txt.text("Off");
			this.updateMoveCount("");
		}
	}
	
	toggleStrict(btn:JQuery) {
		if (this.GameState === GameStateEnum.OFF) {
			return;
		}

		console.log("togglestrict called");
		clearTimeout(this.ActiveTimeout);
		if (this.StrictEnabled) {
			this.turnOffStrictButton(btn);
		} else {
			this.turnOnStrictButton(btn);
		}
	}
	
	turnOffStrictButton(btn:JQuery) {
		console.log("Turning off strict");
		this.StrictEnabled = false;
		btn.removeClass("on");
	}
	
	turnOnStrictButton(btn:JQuery) {
		console.log("Turning on strict");
		this.StrictEnabled = true;
		btn.addClass("on");
	}
	
	copySequence() {
		this.tSequence = this.Sequence.slice(0);
	}
	
	showSequence() {
		if (this.isOff()) {
			return;
		}
		console.log("Showing sequence");
		this.GameState = GameStateEnum.PLAYING_SEQUENCE;
		this.EnteredSeqCorrect = 0;
		this.copySequence();
		this.dumpSequence();
		this.showFirstColor();
	}
	
	dumpSequence() {
		console.log("Dumping sequence");
		this.Sequence.forEach((item) => console.log(item.onColor));
		console.log("Dump done");
	}
	
	showFirstColor() {
		this.tSequence[0].turnOn();
		console.log("turning on first color: " + this.tSequence[0].onColor);
		this.ActiveTimeout = setTimeout(()=>this.showNextColorPause(),2000);
	}
	
	showNextColorPause() {
		this.turnAllButtonsOff();
		this.tSequence.shift();
		console.log("ts len:" + this.tSequence.length);
		if ( (this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE) ) {
			this.ActiveTimeout = setTimeout(()=>this.showNextColor(),500);
		}
	}
	
	showNextColor() {
		if ( (this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE) ) {
			this.tSequence[0].turnOn();
			console.log("turning on next color:" + this.tSequence[0].onColor);
			this.ActiveTimeout = setTimeout(()=>this.showNextColorPause(),2000);
		} else if (this.GameState == GameStateEnum.PLAYING_SEQUENCE) {
			console.log("showNextColor: Your turn");
			this.GameState = GameStateEnum.ENTERING_SEQUENCE;
		}
	}
	
	addMoveToSequence() {
		this.turnAllButtonsOff();
		if (this.Sequence.length == this.WinningSeqCount) {
			this.showWon();
			return;
		}
		this.ActiveTimeout = setTimeout( ()=>{
			let num = Math.floor(Math.random() * 4);
			this.Sequence.push(this.AvailableColors[num]);
			console.log("adding color " + this.AvailableColors[num].onColor + " to sequence");
			this.updateMoveCount(this.Sequence.length.toString());
			this.showSequence();
		},750);
	}

	showWon() {
		this.GameState == GameStateEnum.WON;
		$("#txtMoves").text(":-)");
		this.AvailableColors.forEach((item)=>item.turnLightOn());
		this.ActiveTimeout = setTimeout( ()=> {
			this.AvailableColors.forEach((item)=>item.turnLightOff());
			this.ActiveTimeout = setTimeout( ()=>{
				this.AvailableColors.forEach((item)=>item.turnLightOn());
				this.ActiveTimeout = setTimeout( ()=>{
					this.AvailableColors.forEach((item)=>item.turnLightOff());
					this.ActiveTimeout = setTimeout( ()=>{
						this.AvailableColors.forEach((item)=>item.turnLightOn());
						this.ActiveTimeout = setTimeout( ()=>{
							this.AvailableColors.forEach((item)=>item.turnLightOff());
							this.newGame();
						},700);
					},700);
				},700);
			},700);
		},700);

	}

	isOff() {
		return this.GameState == GameStateEnum.OFF;
	}

	won() {
		return this.GameState == GameStateEnum.WON;
	}
	
	correctSeqEntered(color:ColorButton) {
		return this.Sequence[this.EnteredSeqCorrect].onColor === color.onColor;
	}
	
	startButtonPressed() {
		clearTimeout(this.ActiveTimeout);
		if (this.isOff()) {
			return;
		}
		this.newGame();
	}
	
	newGame() {
		this.GameState = GameStateEnum.ON;
		this.Sequence = [];
		this.updateMoveCount("00");
		this.addMoveToSequence();
		this.showSequence();
	}
	
	colorButtonDown(button:ColorButton) {
		clearTimeout(this.ActiveTimeout);
		if (this.isOff() || this.won()) {
			return;
		}

		if (this.GameState != GameStateEnum.ENTERING_SEQUENCE) {
			this.GameState = GameStateEnum.ENTERING_SEQUENCE;
			this.EnteredSeqCorrect = 0;
		}
		
		if (this.correctSeqEntered(button)) {
			this.EnteredSeqCorrect++;
			button.turnOn();
		} else {
			button.turnOnInvalid();
			if (this.StrictEnabled) {
				this.GameState = GameStateEnum.AWAITING_RESTART;
				this.ActiveTimeout = setTimeout( ()=>this.newGame(),3000);
			} else {
				this.GameState = GameStateEnum.AWAITING_PLAYING_SEQUENCE;
				this.ActiveTimeout = setTimeout( ()=>this.showSequence(),3000);
			}
		}
	}
	
	turnAllButtonsOff() {
		this.AvailableColors.forEach((item)=>item.turnOff());
	}
	
	colorButtonUp(button:ColorButton) {
		if (this.isOff()) {
			return;
		}

		this.turnAllButtonsOff();
		if ( (this.GameState == GameStateEnum.ENTERING_SEQUENCE) 
			&& (this.EnteredSeqCorrect >= this.Sequence.length) ) {
				
			this.addMoveToSequence();
		}
	}
	
	updateMoveCount(t:string) {
		if (t.length == 1) {
			t = "0" + t;
		}
		$("#txtMoves").text(t);
	}
	
}

var simon: Simon;
var svgSupport = false;
$(document).ready( function() {
	simon = new Simon();
	wrongSound = new Audio("http://www.orangefreesounds.com/wp-content/uploads/2014/10/womp-womp.mp3?_=1");
	if (typeof SVGRect != "undefined") {
		console.log("SVG Supported");
		svgSupport = true;
		showSVG();
	} else {
		console.log("SVG is not supported!");
		showNonSVG();
	}

	$("#btnStart").click(()=>simon.startButtonPressed());
	//$("#btnStrict").click(()=>simon.toggleStrict());
	
	$("#btnPower").click(()=>simon.togglePower($("#btnPower"),$("#txtPower")));
	$("#txtPower").click(()=>simon.togglePower($("#btnPower"),$("#txtPower")));
	$("#btnStrict").click(()=>simon.toggleStrict($("#btnStrict")));
	$("*").mouseup(()=>simon.turnAllButtonsOff());

});

function showNonSVG() {
	$("divSVGWrapper").hide();
}

function showSVG() {
	//$("divSVGWrapper").show();
	simon.addColor(	new ColorButton("green","lightgreen",
			new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
			$("#greenButtonSVG")));
	
	simon.addColor(	new ColorButton("red","pink",
			new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
			$("#redButtonSVG")));
			 
	simon.addColor(	new ColorButton("blue", "lightblue",
			new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
			$("#blueButtonSVG")));
	simon.addColor(	new ColorButton("yellow", "lightyellow",
			new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
			$("#yellowButtonSVG")));
}

