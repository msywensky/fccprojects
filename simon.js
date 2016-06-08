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
    ColorButton.prototype.turnOnInvalid = function () {
        var _this = this;
        //this.element.css("fill",this.onColor);
        this.element.addClass("on");
        if ((!wrongSound.paused) || (wrongSound.currentTime > 0)) {
            return;
        }
        wrongSound.addEventListener("ended", function () { return _this.turnOffInvalid(); });
        wrongSound.play();
    };
    ColorButton.prototype.turnOff = function () {
        console.log("turning off " + this.offColor);
        this.element.removeClass("on");
        this.sound.pause();
        this.sound.currentTime = 0;
        this.element.css("fill", this.offColor);
    };
    ColorButton.prototype.turnOffInvalid = function () {
        var _this = this;
        this.element.removeClass("on");
        //this.element.css("fill", this.offColor);
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
})(GameStateEnum || (GameStateEnum = {}));
var Simon = (function () {
    function Simon() {
        this.GameState = GameStateEnum.OFF;
        this.Sequence = [];
        this.EnteredSeqCorrect = 0;
        this.StrictEnabled = false;
        this.AvailableColors = [];
        this.drawGame();
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
    Simon.prototype.drawGame = function () {
    };
    Simon.prototype.togglePower = function (el) {
        console.log("toggle power clicked");
        //let el = $(e.target);
        console.log("game state = " + this.GameState);
        if (this.GameState === GameStateEnum.OFF) {
            this.GameState = GameStateEnum.ON;
            el.addClass("on");
            el.text("On");
            console.log("turning on");
            this.updateMoveCount("- -");
        }
        else {
            el.removeClass("on");
            this.Sequence = [];
            this.GameState = GameStateEnum.OFF;
            console.log("turning off");
            el.text("Off");
            this.updateMoveCount("");
        }
    };
    Simon.prototype.toggleStrict = function () {
        if (this.StrictEnabled) {
            this.turnOffStrictButton();
        }
        else {
            this.turnOnStrictButton();
        }
    };
    Simon.prototype.turnOffStrictButton = function () {
        this.StrictEnabled = false;
    };
    Simon.prototype.turnOnStrictButton = function () {
        this.StrictEnabled = true;
    };
    Simon.prototype.copySequence = function () {
        this.tSequence = this.Sequence.slice(0);
    };
    Simon.prototype.showSequence = function () {
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
        setTimeout(function () { return _this.showNextColorPause(); }, 2000);
    };
    Simon.prototype.showNextColorPause = function () {
        var _this = this;
        this.tSequence[0].turnOff();
        console.log("showNextColor: turning off " + this.tSequence[0].offColor);
        this.tSequence.shift();
        console.log("ts len:" + this.tSequence.length);
        if ((this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE)) {
            setTimeout(function () { return _this.showNextColor(); }, 500);
        }
    };
    Simon.prototype.showNextColor = function () {
        var _this = this;
        if ((this.tSequence.length > 0) && (this.GameState == GameStateEnum.PLAYING_SEQUENCE)) {
            this.tSequence[0].turnOn();
            console.log("turning on next color:" + this.tSequence[0].onColor);
            setTimeout(function () { return _this.showNextColorPause(); }, 2000);
        }
        else if (this.GameState == GameStateEnum.PLAYING_SEQUENCE) {
            console.log("showNextColor: Your turn");
            this.GameState = GameStateEnum.ENTERING_SEQUENCE;
        }
    };
    Simon.prototype.addMoveToSequence = function () {
        var _this = this;
        setTimeout(function () {
            var num = Math.floor(Math.random() * 4);
            _this.Sequence.push(_this.AvailableColors[num]);
            console.log("adding color " + _this.AvailableColors[num].onColor + " to sequence");
            _this.updateMoveCount(_this.Sequence.length.toString());
            _this.showSequence();
        }, 500);
    };
    Simon.prototype.isOff = function () {
        return this.GameState == GameStateEnum.OFF;
    };
    Simon.prototype.correctSeqEntered = function (color) {
        return this.Sequence[this.EnteredSeqCorrect].onColor === color.onColor;
    };
    Simon.prototype.startButtonPressed = function () {
        if (this.isOff()) {
            return;
        }
        this.newGame();
    };
    Simon.prototype.newGame = function () {
        this.Sequence = [];
        this.updateMoveCount("00");
        this.addMoveToSequence();
        this.showSequence();
    };
    Simon.prototype.colorButtonDown = function (button) {
        var _this = this;
        if (this.isOff()) {
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
                setTimeout(function () { return _this.newGame(); }, 3000);
            }
            else {
                this.GameState = GameStateEnum.AWAITING_PLAYING_SEQUENCE;
                setTimeout(function () { return _this.showSequence(); }, 3000);
            }
        }
    };
    Simon.prototype.colorButtonUp = function (button) {
        if (this.isOff()) {
            return;
        }
        button.turnOff();
        /*
        if (this.GameState == GameStateEnum.AWAITING_PLAYING_SEQUENCE) {
            this.showSequence();
        } else if (this.GameState == GameStateEnum.AWAITING_RESTART) {
            this.newGame();
        } else
        */
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
        console.log("SVG Not supported!");
        showNonSVG();
    }
    $("#btnPower").click(function () { return simon.togglePower($("#btnPower")); });
    $("#txtPower").click(function () { return simon.togglePower($("#btnPower")); });
    $("#btnStart").click(function () { return simon.startButtonPressed(); });
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