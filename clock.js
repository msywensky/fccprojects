 class Clock {
   constructor() {
     this.mode = "NONE"; // POM, BREAK
     this.ElapsedTime = "25:00";
     this.PomTime = 25;
     this.BreakTime = 5;
     
     this.isRunning = false;
   }
  // var self = this;
  
  AdjustBreakTime(i) {
    console.log("adjusting break time");
    this.BreakTime = this._adjustTime(this.BreakTime,i);
    if (this.mode==="BREAK") {
      this._initBreakTimer();
    }
  }
   
   AdjustPomTime(i) {
     console.log("adjusting pom time");
     this.PomTime = this._adjustTime(this.PomTime,i);
     if (this.mode != "BREAK") {
       this._initPomTimer();
     }
   }

  _adjustTime(time,interval) {
    if ((time + interval) >= 1) {
      return time + interval;
    } else {
      return time;
    }
  }

   _countDown(sTime) {
     //console.log("_countDown");
     if (sTime === "0:00") {
       return sTime;
     }
     var arr = sTime.split(":");
     var mn = parseInt(arr[0]);
     var sec = parseInt(arr[1]);
     var sSec;
     if (sec == 0) {
       if (mn > 0) {
         --mn;
         sSec = "59";
       }
     } else {
       --sec;
       if (sec < 10) {
         sSec = "0" + sec;
       } else {
         sSec = sec.toString();
       }
     }
     if (mn > 0) {
        arr[0] = mn.toString();
     }
     return mn.toString() + ":" + sSec;
  }

   StartTimer() {
     if (this.mode == "NONE") {
       this._initPomTimer();
     }
      this.timer = setInterval(this.countDown,1000,this);     
      this.isRunning = true;
   }
   
   _timeToElapsedTime(iTime) {
     return iTime.toString() + ":00";
   }
   
   _initPomTimer() {
     this.mode = "POM";
     this.ElapsedTime = this._timeToElapsedTime(this.PomTime);
   }
   
   _initBreakTimer() {
     this.mode = "BREAK";
     this.ElapsedTime = this._timeToElapsedTime(this.BreakTime);
   }
   
  countDown(self) {
    self.ElapsedTime = self._countDown(self.ElapsedTime);
    if (self.ElapsedTime === "0:00") {
      console.log("timer ended: " + self.mode);
      if (self.mode === "POM") {
        return self.PomTimerFinished();
      } else {
        return self.BreakTimerFinished();
      }
    }
    if (self.TimeElapsedCallback) {
      self.TimeElapsedCallback();
    }
    return true;
  }

   StopTimer() {
     clearInterval(this.timer);
     this.isRunning = false;
   }
   
   ResetTimer() {
     this.StopTimer();
     this._initPomTimer();
   }
   
   PomTimerFinished() {
     console.log("pom timer finished");
     this._initBreakTimer();
     if (this.PomFinishedCallback) {
       return this.PomFinishedCallback();
     }
   }

   BreakTimerFinished() {
     console.log("pom timer finished");
     this._initPomTimer();
     if (this.BreakFinishedCallback) {
       return this.BreakFinishedCallback();
     }
   }
   
   SetPomFinishedCallback(f) {
     this.PomFinishedCallback  = f;
   }
   
   SetBreakFinishedCallback(f) {
     this.BreakFinishedCallback = f;
   }
   
   SetElapsedCallback(f) {
     this.TimeElapsedCallback = f;
   }
}
(function() {
  console.log("loading");
    
    var clock = new Clock();

  function resetDOM() {
    document.body.style.background = "lightgreen";
    $("TimeType").innerHTML = "Get to Work!!!";
    
  }  

  clock.SetPomFinishedCallback( function() {
    UpdateUI();
    console.log("pom finished");
    beep();
    document.body.style.background = "lightgray";
    $("TimeType").innerHTML = "Take a break";
  });
  
  clock.SetBreakFinishedCallback( function() {
    UpdateUI();
    console.log("break finished");
    beep();
    resetDOM();
  });

  clock.SetElapsedCallback( function(t) {
    //console.log("elapsed callback called");
    UpdateUI();
  });
  var $ = function(id) {
    var o = document.getElementById(id);
    //alert("o = " + o);
    return o;
  };
  var sbtn = $("StartStopButton");
    sbtn.onclick = function(e) {
      if (clock.isRunning) {
          clock.StopTimer();
          sbtn.innerHTML = "START";
      } else {
        clock.StartTimer();
        sbtn.innerHTML = "STOP";
        UpdateUI();
      }
    }
  $("ResetButton").onclick = function(e) { 
    clock.ResetTimer();
    resetDOM();
    UpdateUI();
  };
  
  $("PTimeSettingIncrease").onclick = function(e) {
    clock.AdjustPomTime(1);
    UpdateUI();
  }

  $("PTimeSettingDecrease").onclick = function(e) {
    clock.AdjustPomTime(-1);
    UpdateUI();
  }

  $("BreakTimeSettingIncrease").onclick = function(e) {
    clock.AdjustBreakTime(1);
    UpdateUI();
  }

  $("BreakTimeSettingDecrease").onclick = function(e) {
    clock.AdjustBreakTime(-1);
    UpdateUI();
  }

  function UpdateUI() {
//    console.log("UpdateUI called");
    $("PTimeNum").innerHTML = clock.ElapsedTime;
    $("BreakTimeNumber").innerHTML = clock.BreakTime;
    $("PTimeSettingNumber").innerHTML = clock.PomTime;
  }
  console.log("Loading done");
  UpdateUI();

var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

//All arguments are optional:

//duration of the tone in milliseconds. Default is 500
//frequency of the tone in hertz. default is 440
//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
//callback to use on end of tone
function beep(duration, frequency, volume, type, callback) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume){gainNode.gain.value = volume;};
    if (frequency){oscillator.frequency.value = frequency;}
    if (type){oscillator.type = type;}
    if (callback){oscillator.onended = callback;}

    oscillator.start();
    setTimeout(function(){oscillator.stop()}, (duration ? duration : 500));
};



})();
