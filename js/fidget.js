var inctone
(function() {
var q = [
'https://bog.jollo.org/spinner/baby1.png',
'https://bog.jollo.org/spinner/baby2.png',
'https://bog.jollo.org/spinner/baby3.png',
'https://bog.jollo.org/spinner/baby4.png',
'https://bog.jollo.org/spinner/baby5.png',
'https://bog.jollo.org/spinner/baby6.png',
'https://bog.jollo.org/spinner/baby7.png',
'https://bog.jollo.org/spinner/baby8.png',
'https://bog.jollo.org/spinner/baby9.png',
]

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

var qblob = [];

// preload images
for (yo=0;yo<q.length;yo++) {
  toDataURL(q[yo], function(dataUrl) {
    qblob.push(dataUrl)
    if (qblob.length == q.length) {
      fidgetspinner()
    }
  })
};

function fidgetspinner() {

  var box = document.getElementById('fidgetspinner')
  var tt = 0
  var abc = 0
  var center = document.getElementById("fidgetspinner")
  var cur = 0
  var tar = 0
  
  function spin() {
  
    center.style.transform = "rotate(" + tt + "deg)"
   
    tt += abc / Math.PI
  
    if ( tt >= 360 ) {
      var f = tt / 360
      var c = Math.floor(f)
      var g = (f - c) * 360
      tt = g 
    }
    else if ( tt <= 0 ) {
      var f = tt / 360
      var c = Math.ceil(f)
      var g = (f - c) * 360
      tt = g  
    }
    
    requestAnimationFrame(spin);
  }
  requestAnimationFrame(spin);
  
  var seek = false
  
  function showval(q) {
    var m = Math.floor(parseInt(q,10))
    var g = parseFloat(q,10)
  }
  
  var weight = []
  for ( i=0;i<200;i++ ) {
    weight.push(0)
  }
  
  
  
  
  function driver() {
    s = Math.ceil(Math.pow((abc/2),1.007))
    function einp(pp) {
      if ( pp == 0 ) {
        return 4
      }
      else {
        return Math.ceil(pp/4.0) * 4
      }
    }
  
    var e = 0
    if (s > 55) {
      e = 8
    }
    else if (s > 50) {
      e = 7
    }
    else if (s > 45) {
      e = 6
    }
    else if (s > 40) {
      e = 5
    }
    else if (s > 35) {
      e = 4
    }
    else if ( s > 30 ) {
      e = 3
    }
    else if ( s > 25 ) {
      e = 2
    }
    else if ( s > 20 ) {
      e = 1
    }
    
    //console.log(s)
    box.setAttribute('style', 'background:url("' + qblob[e] + '"); background-size:contain')
  }
  
  function random(number1,number2) {
    var randomNo = number1 + (Math.floor(Math.random() * (number2 - number1)) + 1);
    return randomNo;
  } 
  
  var KeyX = 1
  var KeyY = 0.01
  var KeyFlag = false;
  
  (function(AudioContext) {
  	AudioContext.prototype.createWhiteNoise = function(bufferSize) {
  		bufferSize = bufferSize || 4096;
  		var node = this.createScriptProcessor(bufferSize, 1, 1);
  		node.onaudioprocess = function(e) {
  			var output = e.outputBuffer.getChannelData(0);
  			for (var i = 0; i < bufferSize; i++) {
  				output[i] = Math.random() * 2 - 1;
  			}
  		}
  		return node;
  	};
  
  	AudioContext.prototype.createPinkNoise = function(bufferSize) {
  		bufferSize = bufferSize || 4096;
  		var b0, b1, b2, b3, b4, b5, b6;
  		b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  		var node = this.createScriptProcessor(bufferSize, 1, 1);
  		node.onaudioprocess = function(e) {
  			var output = e.outputBuffer.getChannelData(0);
  			for (var i = 0; i < bufferSize; i++) {
  				var white = Math.random() * 2 - 1;
  				b0 = 0.99886 * b0 + white * 0.0555179;
  				b1 = 0.99332 * b1 + white * 0.0750759;
  				b2 = 0.96900 * b2 + white * 0.1538520;
  				b3 = 0.86650 * b3 + white * 0.3104856;
  				b4 = 0.55000 * b4 + white * 0.5329522;
  				b5 = -0.7616 * b5 - white * 0.0168980;
  				output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
  				output[i] *= 0.11; // (roughly) compensate for gain
  				b6 = white * 0.115926;
  			}
  		}
  		return node;
  	};
  

  })(window.AudioContext || window.AudioContext);
  
    var audioCtx = new AudioContext();
    var PinkNoise = audioCtx.createPinkNoise();
    var PinkGain = audioCtx.createGain();
  
    var oscillatora = audioCtx.createOscillator()
    var oscillatorb = audioCtx.createOscillator()
    var gainNode = audioCtx.createGain()  
    
    oscillatora.type = "sawtooth"
    oscillatorb.type = "sawtooth"
    oscillatora.connect(gainNode);
    oscillatorb.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    PinkGain.gain.value = 0;
    PinkNoise.connect(PinkGain);
  
    oscillatora.detune.value = 100
    oscillatorb.detune.value = 100
    oscillatora.start(0)
    oscillatorb.start(0)
  
    var initialVol = 0.001  
    gainNode.gain.value = initialVol;
    var maxFreq = 25000;
    var maxVol = 0.3
    var lfo = audioCtx.createOscillator();
    lfo.frequency.value = 1;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0;
  
    function updateLFO(e) {
      var n = e
      
      var osnvala = n * (1 / 2) * 440   
      var osnvalb = n * (1 / 1) * 1    
      
      var osxa = ( osnvala > 22050 ) ? 22050 : osnvala
      var osxb = ( osnvalb > 22050 ) ? 22050 : osnvalb
      
      oscillatora.frequency.value = osxa
      oscillatorb.frequency.value = osxb
      
      gainNode.gain.value = (1) * maxVol
  
      lfo.frequency.value = e*10
      
      var ng = Math.pow(e,0.8)
      if ( ng > 2) {
      ng = 2
      }
      PinkGain.gain.value = ng * 0.1
      lfoGain.gain.value = (ng + (e/200)) * 1
    }
  
  
    lfo.start(0);
    lfo.connect(lfoGain);
    lfoGain.connect(PinkGain.gain);
    gainNode.connect(audioCtx.destination);
    PinkGain.connect(audioCtx.destination);
    
  var avg = []
  for ( i=0;i<10;i++ ) {
    avg.push(0)
  }
  var abc = 0
  
  function updateTone(b) {
    updateLFO(b)
  }
  
  function controller(val) {
    driver()
    //abc += (val===true) ? 1 : (abc>0) ? -1 : 0
    avg.splice(0,1)
    var e = 0
    if ( val === true ) {
      e = 1
      avg.push(2)
    } else {
      avg.push(-1)
    }
    var a = 0
    for (i=0;i<avg.length;i++) {
      a = a + avg[i]
    }
    abc = abc + a/avg.length
    if ( abc > 2000 ) {
      abc = 2000
    }
    if ( 0 > abc ) {
      abc = 0
    }
    
    function coswave(x) {
      if ( x > 1000 ) {
        return 1000
      } else {
        return ((Math.cos( ((Math.PI * x) / 1000) + Math.PI ) * 500) + 500)
      }
    }
    
    updateTone(coswave(abc / 2))
  }
  
  var inctoneready = true
  var inctonecount = 0
  
  var inctonetimeout
  
  inctone = function () {
    if ( inctonecount > 4 ) {
      inctoneready = true
      inctonecount = 0
    } else {
      inctonecount++
      controller(true)
      inctonetimeout = setTimeout(function() {inctone()},10)
    }
  }
  
  var dectonetimeout
  function dectone() {
    controller(false)
    dectonetimeout = setTimeout(function() {dectone()},80)
  }
  dectone()
  
  $('#fidgetholder').on('mousemove',function() {
    if (inctoneready == true) {
      inctoneready = false
      inctone()
      }
    })
    
  $('#fidgetspinner').on('mousemove',function() {
    
    controller(false)
    controller(false)
    controller(false)
    controller(false)

  })

}})()
