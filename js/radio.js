var radiostateuser
var radiostateurl

function activeradiotest() {

  $.ajax({
    url: 'https://bog.jollo.org/audio',
    type: "GET",
    dataType: "json",
    success: function (data) {
      if ( data.playstate == "playing" ) {
        $('html').addClass("radioready")
        radiostateuser = data.current_track.user
        radiostateurl = data.current_track.url
      }
      else {
        if ( !$('html').hasClass("radioplaying") ) {
          $('html').removeClass("radioready")
        }
      }
    }
  })
}

activeradiotest()

var radiostatus = setInterval(function(){
  activeradiotest() 
  }, 30000)

function stopradiostatus() {
  clearInterval(radiostatus)
}

var updatestylesheetinterval = setInterval(function(){
  updatestylesheet()
  }, 30000)

$('#radiobutton').click(function() {
  if ($(this).hasClass("active")) {
    $(this).removeClass("active")
    $(this).addClass("pointereventsnone")
    $('html').removeClass("radioplaying")
    stop()
    setTimeout(function() {
      $('#radiobutton').removeClass("pointereventsnone")
    },3000)
    
  } else {
    $(this).addClass("active")
    $('html').addClass("radioplaying")
    new Audio('http://radio.jollo.org:8000/radio.mp3?cachebuster='+Math.random()).play()
  }
})

var radiofavplaylist

if ( !localStorage.getItem("radiofavplaylist") ) {
  var playlist = []
  localStorage.setItem("radiofavplaylist", JSON.stringify(playlist))
}

radiofavplaylist = JSON.parse(localStorage.getItem("radiofavplaylist"))


function addcurrenttracktoplaylist() {
  radiofavplaylist = uniquepush(radiostateurl, radiofavplaylist)
  localStorage.setItem("radiofavplaylist", JSON.stringify(radiofavplaylist))
}

$('#favcurrenttrackbutton').click(function() {
  $('#radiobutton').addClass("favedtrack")
  setTimeout(function(){
    $('#radiobutton').removeClass("favedtrack")
  },300)
  addcurrenttracktoplaylist()
})