var radiostateuser
var radiostateurl

function activeradiotest() {

  $.ajax({
    url: 'https://bog.jollo.org/audio',
    type: "GET",
    dataType: "json",
    success: function (data) {
      if ( data.playstate == "playing" ) {
        $('html').addClass("radioready radioplaying")
        radiostateuser = data.current_track.user
        radiostateurl = data.current_track.url
      }
      else {
        $('html').removeClass("radioready radioplaying")
      }
    }
  })
}
activeradiotest()
var radiostatus = setInterval(function(){
  activeradiotest() 
  setstylesheetbasedontime()
  }, 10000)

function stopradiostatus() {
  clearInterval(radiostatus)
}

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