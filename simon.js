//I know this is bad, tsk, tsk
var wrongSound;
var ColorButton = (function () {
    function ColorButton(offColor, onColor, sound, element) {
        this.offColor = offColor;
        this.onColor = onColor;
        this.sound = sound;
        this.sound.loop = true;
        this.element = element;
    }
    ColorButton.prototype.turnOn = function () {
        console.log("turning on " + this.onColor);
        this.element.addClass("on");
        //this.element.css({ fill:this.onColor});
        this.sound.play();
    };
    ColorButton.prototype.turnLightOn = function () {
        this.element.addClass("on");
    };
    ColorButton.prototype.turnLightOff = function () {
        this.element.removeClass("on");
    };
    ColorButton.prototype.turnOnInvalid = function () {
        var _this = this;
        this.element.addClass("on");
        console.log("Playing invalid sound");
        /*	if ( (!wrongSound.paused) || (wrongSound.currentTime > 0) ){
                return;
            } */
        wrongSound.addEventListener("ended", function () { return _this.turnOffInvalid(); });
        wrongSound.play();
    };
    ColorButton.prototype.turnOff = function () {
        console.log("turning off " + this.offColor);
        this.element.removeClass("on");
        this.sound.pause();
        this.sound.currentTime = 0;
    };
    ColorButton.prototype.turnOffInvalid = function () {
        var _this = this;
        this.element.removeClass("on");
        wrongSound.removeEventListener("ended", function () { return _this.turnOffInvalid(); });
    };
    return ColorButton;
}());
var GameStateEnum;
(function (GameStateEnum) {
    GameStateEnum[GameStateEnum["OFF"] = 0] = "OFF";
    GameStateEnum[GameStateEnum["ON"] = 1] = "ON";
    GameStateEnum[GameStateEnum["PLAYING_SEQUENCE"] = 2] = "PLAYING_SEQUENCE";
    GameStateEnum[GameStateEnum["ENTERING_SEQUENCE"] = 3] = "ENTERING_SEQUENCE";
    GameStateEnum[GameStateEnum["ADD_TO_SEQUENCE"] = 4] = "ADD_TO_SEQUENCE";
    GameStateEnum[GameStateEnum["AWAITING_RESTART"] = 5] = "AWAITING_RESTART";
    GameStateEnum[GameStateEnum["AWAITING_PLAYING_SEQUENCE"] = 6] = "AWAITING_PLAYING_SEQUENCE";
    GameStateEnum[GameStateEnum["WON"] = 7] = "WON";
})(GameStateEnum || (GameStateEnum = {}));
var Simon = (function () {
    function Simon() {
        this.GameState = GameStateEnum.OFF;
        this.Sequence = [];
        this.EnteredSeqCorrect = 0;
        this.StrictEnabled = false;
        this.AvailableColors = [];
        this.WinningSeqCount = 20; //Lower for testing
        console.log("constructor being called.  GameState:" + this.GameState);
    }
    Simon.prototype.addColor = function (color) {
        this.AvailableColors.push(color);
        var self = this;
        color.element.on("mousedown touchstart", function () { return self.colorButtonDown(color); });
        //color.element.on("mousemove", ()=>self.colorButtonUp(color) );
        color.element.on("mouseup touchend", function () { return self.colorButtonUp(color); });
        //color.element.mousedown(  ()=>self.colorButtonDown(color) );
        //color.element.mouseup(  ()=>self.colorButtonUp(color) );
    };
    Simon.prototype.togglePower = function (btn, txt) {
        console.log("toggle power clicked");
        console.log("game state = " + this.GameState);
        if (this.GameState === GameStateEnum.OFF) {
            this.GameState = GameStateEnum.ON;
            btn.addClass("on");
            txt.text("On");
            console.log("turning on");
            this.updateMoveCount("- -");
        }
        else {
            btn.removeClass("on");
            this.Sequence = [];
            this.GameState = GameStateEnum.OFF;
            console.log("turning off");
            txt.text("Off");
            this.updateMoveCount("");
        }
    };
    Simon.prototype.toggleStrict = function (btn) {
        if (this.GameState === GameStateEnum.OFF) {
            return;
        }
        console.log("togglestrict called");
        clearTimeout(this.ActiveTimeout);
        if (this.StrictEnabled) {
            this.turnOffStrictButton(btn);
        }
        else {
            this.turnOnStrictButton(btn);
        }
    };
    Simon.prototype.turnOffStrictButton = function (btn) {
        console.log("Turning off strict");
        this.StrictEnabled = false;
        btn.removeClass("on");
    };
    Simon.prototype.turnOnStrictButton = function (btn) {
        console.log("Turning on strict");
        this.StrictEnabled = true;
        btn.addClass("on");
    };
    Simon.prototype.copySequence = function () {
        this.tSequence = this.Sequence.slice(0);
    };
    Simon.prototype.showSequence = function () {
        if (this.isOff()) {
            return;
        }
        console.log("Showing sequence");
        this.GameState = GameStateEnum.PLAYING_SEQUENCE;
        this.EnteredSeqCorrect = 0;
        this.copySequence();
        this.dumpSequence();
        this.showFirstColor();
    };
    Simon.prototype.dumpSequence = function () {
        console.log("Dumping sequence");
        this.Sequence.forEach(function (item) { return console.log(item.onColor); });
        console.log("Dump done");
    };
    Simon.prototype.showFirstColor = function () {
        var _this = this;
        this.tSequence[0].turnOn();
        console.log("turning on first color: " + this.tSequence[0].onColor);
        this.ActiveTimeout = setTimeout(function () { return _this.showNextColorPause(); }, 2000);
    };
    Simon.prototype.showNextColorPause = function () {
        var _this = this;
        this.turnAllButtonsOff();
        this.tSequence.shift();
        console.log("ts len:" + this.tSequence.length);
        if ((this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE)) {
            this.ActiveTimeout = setTimeout(function () { return _this.showNextColor(); }, 500);
        }
    };
    Simon.prototype.showNextColor = function () {
        var _this = this;
        if ((this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE)) {
            this.tSequence[0].turnOn();
            console.log("turning on next color:" + this.tSequence[0].onColor);
            this.ActiveTimeout = setTimeout(function () { return _this.showNextColorPause(); }, 2000);
        }
        else if (this.GameState == GameStateEnum.PLAYING_SEQUENCE) {
            console.log("showNextColor: Your turn");
            this.GameState = GameStateEnum.ENTERING_SEQUENCE;
        }
    };
    Simon.prototype.addMoveToSequence = function () {
        var _this = this;
        this.turnAllButtonsOff();
        if (this.Sequence.length == this.WinningSeqCount) {
            this.showWon();
            return;
        }
        this.ActiveTimeout = setTimeout(function () {
            var num = Math.floor(Math.random() * 4);
            _this.Sequence.push(_this.AvailableColors[num]);
            console.log("adding color " + _this.AvailableColors[num].onColor + " to sequence");
            _this.updateMoveCount(_this.Sequence.length.toString());
            _this.showSequence();
        }, 750);
    };
    Simon.prototype.showWon = function () {
        var _this = this;
        this.GameState == GameStateEnum.WON;
        $("#txtMoves").text(":-)");
        this.AvailableColors.forEach(function (item) { return item.turnLightOn(); });
        this.ActiveTimeout = setTimeout(function () {
            _this.AvailableColors.forEach(function (item) { return item.turnLightOff(); });
            _this.ActiveTimeout = setTimeout(function () {
                _this.AvailableColors.forEach(function (item) { return item.turnLightOn(); });
                _this.ActiveTimeout = setTimeout(function () {
                    _this.AvailableColors.forEach(function (item) { return item.turnLightOff(); });
                    _this.ActiveTimeout = setTimeout(function () {
                        _this.AvailableColors.forEach(function (item) { return item.turnLightOn(); });
                        _this.ActiveTimeout = setTimeout(function () {
                            _this.AvailableColors.forEach(function (item) { return item.turnLightOff(); });
                            _this.newGame();
                        }, 700);
                    }, 700);
                }, 700);
            }, 700);
        }, 700);
    };
    Simon.prototype.isOff = function () {
        return this.GameState == GameStateEnum.OFF;
    };
    Simon.prototype.won = function () {
        return this.GameState == GameStateEnum.WON;
    };
    Simon.prototype.correctSeqEntered = function (color) {
        return this.Sequence[this.EnteredSeqCorrect].onColor === color.onColor;
    };
    Simon.prototype.startButtonPressed = function () {
        clearTimeout(this.ActiveTimeout);
        if (this.isOff()) {
            return;
        }
        this.newGame();
    };
    Simon.prototype.newGame = function () {
        this.GameState = GameStateEnum.ON;
        this.Sequence = [];
        this.updateMoveCount("00");
        this.addMoveToSequence();
        this.showSequence();
    };
    Simon.prototype.colorButtonDown = function (button) {
        var _this = this;
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
        }
        else {
            button.turnOnInvalid();
            if (this.StrictEnabled) {
                this.GameState = GameStateEnum.AWAITING_RESTART;
                this.ActiveTimeout = setTimeout(function () { return _this.newGame(); }, 3000);
            }
            else {
                this.GameState = GameStateEnum.AWAITING_PLAYING_SEQUENCE;
                this.ActiveTimeout = setTimeout(function () { return _this.showSequence(); }, 3000);
            }
        }
    };
    Simon.prototype.turnAllButtonsOff = function () {
        this.AvailableColors.forEach(function (item) { return item.turnOff(); });
    };
    Simon.prototype.colorButtonUp = function (button) {
        if (this.isOff()) {
            return;
        }
        this.turnAllButtonsOff();
        if ((this.GameState == GameStateEnum.ENTERING_SEQUENCE)
            && (this.EnteredSeqCorrect >= this.Sequence.length)) {
            this.addMoveToSequence();
        }
    };
    Simon.prototype.updateMoveCount = function (t) {
        if (t.length == 1) {
            t = "0" + t;
        }
        $("#txtMoves").text(t);
    };
    return Simon;
}());
var simon;
var svgSupport = false;
$(document).ready(function () {
    simon = new Simon();
    wrongSound = new Audio("http://www.orangefreesounds.com/wp-content/uploads/2014/10/womp-womp.mp3?_=1");
    if (typeof SVGRect != "undefined") {
        console.log("SVG Supported");
        svgSupport = true;
        showSVG();
    }
    else {
        console.log("SVG is not supported!");
        showNonSVG();
    }
    $("#btnStart").click(function () { return simon.startButtonPressed(); });
    //$("#btnStrict").click(()=>simon.toggleStrict());
    $("#btnPower").click(function () { return simon.togglePower($("#btnPower"), $("#txtPower")); });
    $("#txtPower").click(function () { return simon.togglePower($("#btnPower"), $("#txtPower")); });
    $("#btnStrict").click(function () { return simon.toggleStrict($("#btnStrict")); });
    $("*").mouseup(function () { return simon.turnAllButtonsOff(); });
});
function showNonSVG() {
    $("divSVGWrapper").hide();
}
function showSVG() {
    //$("divSVGWrapper").show();
    simon.addColor(new ColorButton("green", "lightgreen", new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"), $("#greenButtonSVG")));
    simon.addColor(new ColorButton("red", "pink", new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"), $("#redButtonSVG")));
    simon.addColor(new ColorButton("blue", "lightblue", new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"), $("#blueButtonSVG")));
    simon.addColor(new ColorButton("yellow", "lightyellow", new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"), $("#yellowButtonSVG")));
}
//# sourceMappingURL=simon.js.map