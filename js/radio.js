var radiostatetitle
var radiostateurl
var marqueepower
var timerpower
var countdownmode = true
var youtubetrackready = true

if ( !localStorage.getItem("countdownmode") ) {
  localStorage.setItem("countdownmode", JSON.stringify(countdownmode))
}
else {
  countdownmode = JSON.parse(localStorage.getItem("countdownmode"))
}

var ejectplayer = {
  data: {
    tracks: [],
    currenttrackfilename: null,
  },
  build: () => {
    var currenttrackfilename
    if (ejectplayer.data.currenttrackfilename) {
      currenttrackfilename = ejectplayer.data.currenttrackfilename
    }
    for (var q = 0; q < ejectplayer.data.tracks.length ; q++ ) {
      if (ejectplayer.data.tracks[q] && ejectplayer.data.tracks[q].title ) {
        var currenttrack = (ejectplayer.data.tracks[q].filename == currenttrackfilename) ? "currenttrack" : ""
        var title = ejectplayer.data.tracks[q].title.substring(0,100)
        var filename = ejectplayer.data.tracks[q].filename
        $('#radioejectdisplaycontent').append('                                  \
          <div data-id="'+filename+'" class="radioplaylistrow '+currenttrack+'"> \
            <div class="radioplaylisttrack">'+title+'</div>                      \
            <div class="radioplaylistduration"> xxxx</div>                       \
          </div>                                                                 \
        ')       
      }
    }

  },
  clear: () => {
    $('#radioejectdisplaycontent').html("")
  },
  close: () => {
    $('#radioejectdisplay').removeClass("undim")
    ejectplayer.clear()
    $('#radioejection').removeClass("open")
    $('#radioeject').addClass("closed")
  },
  open: () => {
    ejectplayer.clear()
    setTimeout(function(){
      ejectplayer.build()
      setTimeout(function(){
        $('#radioejectdisplay').addClass("undim")
      },100)
    },500)
    $('#radioejection').addClass("open")
    $('#radioeject').removeClass("closed")    
  }
  
}

var radiohudtimer = {
  
  data: {
    remain:0,
    uptick:0
  },
  init: () => {
    timerpower = setInterval(
      () => { 
        radiohudtimer.update()
      }, 1000
    );
  },
  reset: () => {
    clearInterval(timerpower)
    radiohudtimer.init()
  },  
  feed: (x) => {
    if (!x) {
      x = 0
    }
    radiohudtimer.reset()
    radiohudtimer.data.remain = x
  },
  stop: () => {
    clearInterval(timerpower)
  },
  update: () => {
    if (youtubetrackready) {
      var q = radiohudtimer.data.remain
      if (q <= 0) {
        q = 0
        radiohudtimer.stop()
      }
      var t = radiohudtimer.data.uptick
      function parsehms(e) {
        var sec_num = parseInt(e, 10)
        var minutes = Math.floor((sec_num / 60))
        var seconds = sec_num - (minutes * 60)
        if (seconds < 10) {
          seconds = "0"+seconds
        }
        return (minutes+':'+seconds)
      }
      if (countdownmode) {
        $('#radioledactive').html("-" + parsehms(q))
      }
      else {
        $('#radioledactive').html(parsehms(t))
      }
      radiohudtimer.data.remain--
      radiohudtimer.data.uptick++
    }
    else {
      $('#radioledactive').html("")
    }
    
  }
  
}

var radiohudmarquee = {
  data: {
    text: "",
    count: 0,
    target: 0
  },
  init: () => {
    marqueepower = setInterval(
      () => { 
        radiohudmarquee.scroll()
      }, 400
    );
  },
  reset: () => {
    clearInterval(marqueepower)
    radiohudmarquee.init()
  },
  stop: () => {
    clearInterval(marqueepower)
    radiohudmarquee.data.text = ""
    radiohudmarquee.data.count = 0
    radiohudmarquee.data.target = 0
  },
  feed: (x) => {
    radiohudmarquee.reset()
    if (!x) {
      x = "?????"
    }
    radiohudmarquee.data.text = x.substring(0,100).toUpperCase().replace(/ /g,"_")
    radiohudmarquee.data.count = 0
    radiohudmarquee.data.target = radiohudmarquee.data.text.length
  },
  scroll: () => {
    if (radiohudmarquee.data.target <= 24) {
      $('#radiotext').html(radiohudmarquee.data.text.replace(/\_/g,"&nbsp;").replace(/\'/,"&apos;").replace(/\"/,"&quot;").replace(/\>/,"&gt;").replace(/\</,"&lt;"))
    }
    else {
      var n = radiohudmarquee.data.text
      var k = radiohudmarquee.data.target
      var marqueedisplay = n + "_***_" + n + "_***_"
      var activedisplay = marqueedisplay.substring(radiohudmarquee.data.count,radiohudmarquee.data.count + 24)
      radiohudmarquee.data.count++
      if ((radiohudmarquee.data.count - 5) >= radiohudmarquee.data.target) {
        radiohudmarquee.data.count = 0
      }
      $('#radiotext').html(activedisplay.replace(/\_/g,"&nbsp;").replace(/\'/,"&apos;").replace(/\"/,"&quot;").replace(/\>/,"&gt;").replace(/\</,"&lt;"))
    }
  }
}
radiohudmarquee.init()

var updatestylesheetinterval = setInterval(function(){
  updatestylesheet()
  }, 30000)

$('#radiobutton').click(function() {
  function radiobuttontoggle(){
    if ($('#radiobutton').hasClass("active")) {
      $('#radiobutton').removeClass("active")
      $('#radiobutton').addClass("pointereventsnone")
      $('html').removeClass("radioplaying")
      stop()
      setTimeout(function() {
        $('#radiobutton').removeClass("pointereventsnone")
      },3000)
      
    } else {
      $('#radiobutton').addClass("active")
      $('html').addClass("radioplaying")
      new Audio('http://radio.jollo.org:8000/radio.mp3?cachebuster='+Math.random()).play()
    }
  }
  
  if ($('#radioejection').hasClass("open")) {
    ejectplayer.close()
    setTimeout(function() {
      radiobuttontoggle()
    },600)
  }
  else {
    radiobuttontoggle()
  }
})

var radiofavplaylist

if ( !localStorage.getItem("radiofavplaylist") ) {
  var playlist = []
  localStorage.setItem("radiofavplaylist", JSON.stringify(playlist))
}

var radiofavplaylistdatabase

if ( !localStorage.getItem("radiofavplaylistdatabase") ) {
  var playlistdatabase = {}
  localStorage.setItem("radiofavplaylistdatabase", JSON.stringify(playlistdatabase))
}

radiofavplaylist = JSON.parse(localStorage.getItem("radiofavplaylist"))
radiofavplaylistdatabase = JSON.parse(localStorage.getItem("radiofavplaylistdatabase"))

function addcurrenttracktoplaylist() {
  radiofavplaylist = uniquepush(radiostateurl, radiofavplaylist)
  radiofavplaylistdatabase[btoa(radiostateurl)] = btoa(radiostatetitle)
  localStorage.setItem("radiofavplaylist", JSON.stringify(radiofavplaylist))
  localStorage.setItem("radiofavplaylistdatabase", JSON.stringify(radiofavplaylistdatabase))
}

$('#radioledactive').click(function() {
  countdownmode = !countdownmode
  localStorage.setItem("countdownmode", JSON.stringify(countdownmode))
  radiohudtimer.update()
})

$('#favcurrenttrackbutton').click(function() {
  $('#radiosubtext').html("FAVED")
  $('#radiosubtext').addClass("viz")
  
  setTimeout(function(){
    $('#radiosubtext').removeClass("viz")
  },300)
  addcurrenttracktoplaylist()
})

$('#radiosource').click(function() {
  window.open(radiostateurl);
})



$('#radioejection').click(function() {
  
  $('#radioejection').css('pointer-events',"none")
  setTimeout(function() {$('#radioejection').css('pointer-events',"all")},1000) 
  
  if ($('#radioejection').hasClass("open")){
    ejectplayer.close()
  }
  else {
    ejectplayer.open()
  }
})

var radiohudmode
if (!localStorage.getItem("radiohudmode")) {
  radiohudmode = 1
  localStorage.setItem("radiohudmode", 1)
} else {
  radiohudmode = JSON.parse(localStorage.getItem("radiohudmode"))
  toggleradiohudmode(radiohudmode)
}


function toggleradiohudmode(i) {
  
}

// $('.radiocontrol').on("click",function(){
//   $('.radiocontrol').html("_")
//   $(this).html("x")
// })