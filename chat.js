String.prototype.hashCode = function() {
  var hash = 0, i, chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}

var userlist = [ ]

function uniquepush(item,oldarray) {
  if ( oldarray.indexOf(item) === -1 ) {
    oldarray.push(item)
  }
  return oldarray
}

function storefavitems(id) {
  // if its already set then unset it
  function pushfavbundle(item) {
    var favbundle = [ ]
    if ( localStorage.getItem("favbundle") ) {
      favbundle = JSON.parse(localStorage.getItem("favbundle"))
    }
    favbundle = uniquepush(item,favbundle)
    localStorage.setItem("favbundle", JSON.stringify(favbundle))
  }
  if ( $('p[data-id="' + id + '"]').length > 0 ) {
    if ( $('p[data-id="' + id + '"]').find("img").length > 0 ) {
      for ( i=0;i<($('p[data-id="' + id + '"]').find("img").length);i++) {
        pushfavbundle($('p[data-id="' + id + '"]').find("img")[i].src)
      }
    }
  }
}

function richtext(input) {
  function checkimgurl(url) {
    return(url.match(/\.(jpeg|jpg|gif|png|bmp|JPEG|JPG|GIF|PNG|BMP)$/) != null)
  }
  function checklinkurl(url) {
    return (url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/) != null)
  }
  var string = input.split(" ")
  for (i=0;i<string.length;i++) {
    var word = string[i]
    if (checkimgurl(word)) {
      word = `<img draggable="true" onmousedown="showstored(true)" ondrag="dragready()" onmouseup="showstored(false)" ondragend="showstored(false)" src="${word}">`
    }
    else if (checklinkurl(word)) {
      word = `<a target="_blank" href="${word}">${word}</a>`
    }
    string[i] = word
  }
  string = string.join(" ")
  var nospaceregex = /\"\>(\s+)\<img\s/g
  var nsstring = string.replace(nospaceregex, '"><ns></ns><img ')
  var forcespaceregex = /\s?\{([0-9].{1,2})\}\s/gim
  var match = forcespaceregex.exec(nsstring)
  if (match) {
    var num = match[1]
    var forcespaceregex = /\s?\{([0-9].{1,2})\}\s/gim
    var esstring = nsstring.replace(forcespaceregex, '<ns style="width:' + num + 'px; display:inline-block"></ns>')
    return esstring
  }
  else {
    return nsstring
  }
}

var connection
var visible
var unread = 0
var mentionstar = ""
var muted
var locked = false
var dragpop = false
var terminalmode = false
var joelmode = false
var joelnormallaunch = false

function toggleterminalmode() {
  if (terminalmode) {
    terminalmode = false
    $('body').removeClass("terminal")
  }
  else {
    terminalmode = true
    $('body').addClass("terminal")
  }
}

function togglejoelmode() {
  if (!terminalmode) {
    terminalmode = true
    joelmode = true
    $('body').addClass("terminal")
    $('#msg #input').addClass("dark")
  }
  else {
    if (joelmode) {
      joelmode = false
      $('#msg #input').removeClass("dark")
    }
    else {
      joelmode = true
      $('#msg #input').addClass("dark")
    }
  }
}

function dragready() {
  dragcount = true
}

function dragpopup() {
  if (dragcount) {
     if (!$('#storedarea').hasClass('makeroom')) {
      dragpop = true
      dragcount = false
      propagatestored()
      $('#storedarea').toggleClass('makeroom')
      $('#msg #input').toggleClass('makeroom')
    }
  }
}

if ( !localStorage.getItem("muted") ) {
  localStorage.setItem("muted","0")
  muted = false
}
else {
  var mutedstatus = localStorage.getItem("muted")
  if ( mutedstatus == "1" ) {
    $('#mutebutton').addClass("muted")
    muted = true
  }
}

document.addEventListener('visibilitychange',function() {
  if (document.hidden) {
    visible = false
  }
  else {
    unread = 0
    mentionstar = ""
    visible = true
    $('#title').html('bogchat')
  }
}, false )

function bogscript(a,b) {
  // a = action
  // b = optional data
  console.log(`action: ${a}, context: ${b}`)

  // fav last image
  if ( a == "fav") {
    if (!b) {
      //
      // get last image posted
      var lastimgdataid = $("#content").find("img:last").parent().attr("data-id")
      favpost(lastimgdataid)
    }
    else {
      // todo.. e.g. custom force fav post like last text post
      var bb = b.split(" ")
      var nick = $("#content").find('span:contains("' + bb[0] + '"):last').parent().attr("data-id")
      if (nick) {
        //console.log(nick + " " + bb[0])
        favpost(nick)
      }
    }
  }
  else if ( a == "nightmode") {
    $('link[rel=stylesheet]').remove()
    $('head').append('<link rel="stylesheet" href="style-night.css" type="text/css">')
  }
  else if ( a == "clear" ) {
    $('#content').html('')
  }
  else if ( a == "term") {
    toggleterminalmode()
  }
  else if ( a == "joel" ) {
    if (joelnormallaunch) {
      joelnormallaunch = false
      joelmode = false
      $('#msg #input').removeClass("dark")
      terminalmode = false
      $('body').removeClass("terminal")
    }
    else if (!joelmode && !terminalmode) {
      joelnormallaunch = true
      togglejoelmode()
    }
    else {
      togglejoelmode()
    }
  }
  else if ( a == "msg" ) {
    if (b) {
      connection.send(JSON.stringify({type: "message", data: b}))
    }
  }
  else if ( a == "starfox" || a == "/" ) {
    $('#content').toggleClass("starfox")
  }

  // 
  // todo: me
  
}

var ibhistory = [""]
var signal = [ ]
var ibtemp = ""
var ibstate = 1
var tabready = true
var tabcount = 0
var myname

function startwebsocket() {
  

  
  "use strict"
  
  var content = $('#content')
  var input = $('#input')
  var status = $('#status')

  var mycolor = false
  myname = false

  window.WebSocket = window.WebSocket || window.MozWebSocket

  if (!window.WebSocket) {
    content.html($('<p>', { text: 'nosocketsupportsorry'} ))
    input.hide()
    $('span').hide()
    return
  }
  //prod
  connection = new WebSocket('wss://chat.bog.jollo.org')

  connection.onclose = function () {
    console.log("close event received")
  }
  connection.onopen = function () {
    $('#input').removeClass("weaksignal")
    signal = [ ]
    setTimeout(function(){$('#content').scrollTop(200000)},1000)
    setTimeout(function(){$('#content').scrollTop(200000)},2000)
    input.removeAttr('disabled')
    input.val("")
    status.text('choose name:')
    if (!localStorage.getItem("nick")) {
      $('body').addClass("setnick")
    }
    else {
      myname = localStorage.getItem("nick")
      connection.send(JSON.stringify({type: "nick", data: myname}))
    }
  }

  connection.onerror = function (error) {
    content.html($('<p>', { text: 'serverr' } ))
  }
  
  connection.onmessage = function (message) {
    try {
      var json = JSON.parse(message.data)
    } catch (e) {
      console.log('badjson: ', message.data)
      return
    }
    if (json.type === 'color') {
      mycolor = json.data
      status.text(myname + ': ').css('color', mycolor)
      input.removeAttr('disabled').focus()
    } else if (json.type === 'history') { 
      console.log
      for (var i=0; i < json.data.length; i++) {
        addMessage(json.data[i].author, json.data[i].text,
               json.data[i].color, json.data[i].id)
      }
      $('#content').scrollTop(200000)
    } else if (json.type === 'message') {
      
      if (visible === false) {
        unread++
        if ( json.data.text.includes(myname)) {
          mentionstar = "*"
        }
        $('#title').html(`${mentionstar}(${unread}) bogchat`)
      }
      input.removeAttr('disabled')
      addMessage(json.data.author, json.data.text,
        json.data.color, json.data.id)
      if ( ($('#content').height() - $('#content p:last-of-type').offset().top) < -500 ) {
        // console.log("avoid scrolldown")
      }
      else {
        $('#content').scrollTop(200000)
        setTimeout(function(){$('#content').scrollTop(200000)},300)
        setTimeout(function(){$('#content').scrollTop(200000)},1000)
      }
    } else if ( json.type === "hi" ) {
      if (!muted) {
        new Audio('https://bog.jollo.org/enter.mp3').play()
      }
    } else if ( json.type === "byebye" ) {
      if (!muted) {
        new Audio('https://bog.jollo.org/exit.mp3').play()
      }
    } else if ( json.type === "treehouse" ) {
      
    } else if ( json.type === "fav" ) {
      $('p[data-id="' + json.data + '"] span').addClass("jiggle")
      setTimeout(function(){$('p[data-id="' + json.data + '"] span').removeClass("jiggle")},300)
    } else if ( json.type === "pong" ) {
      // remove ping from signal [ ]
      // json.data
      signal.pop()
      signal.pop()
    }
    else {
      console.log('vbadjson: ', json)
    }
  }
  
  var testsignalstrength = setInterval(function() {
    if (signal.length < 8) { 
      signal.push("ping")
      connection.send(JSON.stringify({type: "ping", data: 0}))
    } 
  }, 2000)
  
  var viewsignalstrength = setInterval(function() {

    if (signal.length > 3 ) {
      $('#input').addClass("weaksignal")
    }
    else {
      if ($('#input').hasClass("weaksignal")) {
        $('#input').removeClass("weaksignal")
      }
    }
  }, 2000)
  
  var trybadcomm = setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('error..')
      input.attr('disabled', 'disabled').val('badcomm')
      connection.close()
      reconnectbadcomm()
    }
  }, 4000)
  
  function reconnectbadcomm() {

    clearInterval(trybadcomm)
    input.attr('disabled', 'disabled').val('reconnecting..')
    setTimeout(function(){ startwebsocket()},2000) 
  }
  
}
startwebsocket()

$('#input').keydown(function(e) {

  var msg = $(this).val()
  
  if ( e.keyCode != 9 ) {
    tabready = false
    tabcount = 0
  }
  
  if ( e.keyCode === 9 ) {
    e.preventDefault()
    var tabscan
    if (tabready === false) {
      var spaces = msg.split(" ")
      var lastword = spaces[spaces.length - 1]
      tabready = lastword
      tabcount = 0
    }
    userlist.sort()
    console.log("> " + tabready)
    tabcount++
  }
  else if (e.keyCode === 13) {

    if (!msg) {
      return
    }
    
    $(this).val('') 
    if (myname === false) {
      myname = msg
      localStorage.setItem("nick",msg)
      $('body').removeClass("setnick")
      connection.send(JSON.stringify({type: "nick", data: msg}))
    }
    else {
      ibtemp = ""
      ibhistory.push(msg)
      ibstate = ibhistory.length
      var x = msg
      var b = msg.trim()
      if ( joelmode ) {
        if ( b.substr(0,1) == "/") {
          b = b.substr(1,b.length - 1)
        }
        b = b.split(" ")
        var g = b.shift()
        b = b.join(" ")
        bogscript(g,b) 
      }
      else {
        if ( b.substr(0,1) == "/") {
          b = b.substr(1,b.length - 1)
          b = b.split(" ")
          var g = b.shift()
          b = b.join(" ")
          bogscript(g,b)
        }
        else {
          connection.send(JSON.stringify({type: "message", data: x}))
        }
      }
    }
  $('#content').scrollTop(200000)
  }
  else if (e.keyCode === 38) {
    if (ibstate <= 0) {
      $('#msg #input').val("")
    }
    else if ( ibstate == (ibhistory.length)) {

      if (msg == undefined) {
        msg = ""
      }
      ibtemp = msg //value thats in the input box now
      ibstate--
      $('#msg #input').val(ibhistory[ibstate])
    }
    else {
      ibstate--
      $('#msg #input').val(ibhistory[ibstate])
    }
  }
  else if (e.keyCode === 40) {
    if (  ibstate >= (ibhistory.length)) {
      return // value already in box
    } 
    else {
      ibstate++
      if (ibstate == (ibhistory.length)) {
         $('#msg #input').val(ibtemp)
      }
      else {
         $('#msg #input').val(ibhistory[ibstate])
      }
    }      
  }
})

function favrequest(e) {
  console.log(e)
}

function addMessage(author, message, color, id) {
  userlist = uniquepush(author,userlist)
  $('#content').append(`<p data-id="${id}"><span class="nick" style="color:${color}">${author}</span>: ${richtext(message)}</p>`)
}

$(document).on('click','p img',function(e) {
  var i = $(this).parent()
  favpost(i[0].dataset.id)
  $(this).parent().addClass("faved")
})

$(document).on('click','span.nick',function(e) {
  var i = $(this).parent()
  favpost(i[0].dataset.id)
  $(this).parent().addClass("faved")
})
  
// stored images 


$('#storedbutton').click(function() {
  propagatestored()
  $('#storedarea').toggleClass('makeroom')
  $('#msg #input').toggleClass('makeroom')
})


function showstored(e) {
  if (e) {
    $('#storedinput').addClass('visible')
    $('#storedinput').val('')
    propagatestored()
  }
  else {
    dragcount = false
    $('#storedinput').removeClass('visible')
    if ( $('#storedinput').val() ) {
      storedpush( $('#storedinput').val())
    }
    if (dragpop) {
      setTimeout(function() {
        dragpop = false
        $('#storedarea').removeClass('makeroom')
        $('#msg #input').removeClass('makeroom')      
      },300)
    }
  }
}

function storedpush(e) {
  var oldstored = localStorage.getItem("stored")
  if ( !oldstored) {
    oldstored = []
  }
  else {
    oldstored = JSON.parse(oldstored)
  }
  oldstored.push(e)
  localStorage.setItem("stored",JSON.stringify(oldstored))
  propagatestored(e)
}

function propagatestored(e) {

  if (!this.stored) {
    this.stored = true
    var oldstored = localStorage.getItem("stored")
    if ( !oldstored) {
      oldstored = []
      $( "#storedcontainer" ).html('drag images here to use later')
    }
    else {
      $( "#storedcontainer" ).html('')
    oldstored = JSON.parse(oldstored)
    }
    for (var i=(oldstored.length - 1);i>=0;i--) {
      $( "#storedcontainer" ).append(`<img src="${oldstored[i]}"> &nbsp;`)
    }
  }
  if (e) {
    $( "#storedcontainer" ).prepend(`<img src="${e}">  &nbsp;`)
  }
}

$(document).on('click','#storedcontainer img',function(e) {
  var neue = e.toElement.currentSrc
  var oldval = $('#msg #input').val()
  var oldval = `${oldval} ${neue} `
  $('#input').val(oldval)
})




// image uploader

var feedback = function (res) {
  if (res.success === true) {
     if (locked) {
      var x = res.data.link
      var oldval = $('#msg #input').val()
      var oldval = `${oldval} ${x} `
      $('#input').val(oldval)       
     }
     else {
       connection.send(JSON.stringify({type: "message", data: res.data.link}))
     }
  }
}

var videoopen = false
var video = document.getElementById('video');
var localstream

function cameraopen(){
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.src = window.URL.createObjectURL(stream)
    localstream = stream
    video.play()
  })
}

else if (navigator.getUserMedia) { 
  navigator.getUserMedia({ video: true }, function(stream) {
    video.src = stream
    localstream = stream
    video.play()
  }, errBack)
} 
else if (navigator.webkitGetUserMedia) { 
  navigator.webkitGetUserMedia({ video: true }, function(stream){
    video.src = window.webkitURL.createObjectURL(stream);
    localstream = stream
    video.play()
  }, errBack)
} 
else if(navigator.mozGetUserMedia) { 
  navigator.mozGetUserMedia({ video: true }, function(stream){
      video.src = window.URL.createObjectURL(stream)
      localstream = stream
      video.play()
    }, errBack)
  }
}


var canvas = document.getElementById('canvas')
var context = canvas.getContext('2d')
var video = document.getElementById('video')

function webcamtoimgur(uri) {
  var clientId = "a91768c3de50774";               
  $.ajax({
      url: "https://api.imgur.com/3/upload",
      type: "POST",
      datatype: "json",
      data: {
      'image': uri,
      'type': 'base64'
    },
    success: fdone,
    error: function(){console.log("failed")},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
    }
  })
}

function imagefiletoimgur(uri) {
  var clientId = "a91768c3de50774";               
  $.ajax({
      url: "https://api.imgur.com/3/upload",
      type: "POST",
      datatype: "json",
      data: {
      'image': uri,
      'type': 'base64'
    },
    success: feedback,//calling function which displays url
    error: function(){console.log("failed")},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
    }
  })
}

$('#videoclose').click(function() {
  localstream.getVideoTracks()[0].stop()
  videoopen = false
  $('#videobox').addClass('hidden')
  $('#camerabutton').removeClass('howto')
})

$('#camerabutton').click(function() {
  if (!videoopen) {
    $('#camerabutton').addClass('howto')
    $('#videobox').removeClass('hidden')
    videoopen = true
    cameraopen()
    $('#camerabutton').prop("disabled", true)
    setTimeout(function(){
    $('#camerabutton').prop("disabled", false);
    },1200);
  }
  else {
    context.drawImage(video, 0, 0, 400, 300)
    var image = $('#canvas').getCanvasImage()
    var uri = image.substring(22)
    webcamtoimgur(uri)
    $('#camerabutton').prop("disabled", true)
    setTimeout(function(){
    $('#camerabutton').prop("disabled", false);
    },3000);
  }
})


function fdone(data) {
  connection.send(JSON.stringify({type: "message", data: data.data.link}))
}

$(document).on('click','#uploadbutton',function() {
  $('#fileinput').trigger('click');
})

$('#mutebutton').click(function() {
  if ($(this).hasClass("muted")) {
    $('#mutebutton').removeClass("muted")
    localStorage.setItem("muted","0")
    muted = false
  }
  else {
    muted = true
    $('#mutebutton').addClass("muted")
    localStorage.setItem("muted","1")
  }
})

$('#lockbutton').click(function() {
  if ($(this).hasClass("locked")) {
    $('#lockbutton').removeClass("locked")
    $('#uploadbutton').removeClass("locked")
    locked = false
  }
  else {
    $('#lockbutton').addClass("locked")
    $('#uploadbutton').addClass("locked")
    locked = true
  }
})


function favpost(id) {
  storefavitems(id)
  connection.send(JSON.stringify({type: "fav", data: id}))
}

function pushfile() {
  var file    = document.getElementById("fileinput").files[0];
  var reader  = new FileReader()

  reader.addEventListener("load", function () {
    var base = reader.result
    var firstcomma = base.indexOf(",")
    var base = base.substring((firstcomma + 1),(base.length))
    imagefiletoimgur(base)
  }, false);

  if (file) {
    reader.readAsDataURL(file)
  }
}

function scrollHorizontally(e) {
  e = window.event || e
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
  document.getElementById('storedcontainer').scrollLeft -= (delta*40)
  e.preventDefault()
}
if (document.getElementById('storedcontainer').addEventListener) {
  document.getElementById('storedcontainer').addEventListener("mousewheel", scrollHorizontally, false)
  document.getElementById('storedcontainer').addEventListener("DOMMouseScroll", scrollHorizontally, false)
} else {
  document.getElementById('storedcontainer').attachEvent("onmousewheel", scrollHorizontally)
}

window.onload = function() {

  setTimeout(function(){$('#content').scrollTop(200000)},3000)
}
