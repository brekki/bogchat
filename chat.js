function imgio(input) {
  function checkurl(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }
  var string = input.split(" ")

  for (i=0;i<string.length;i++) {
    var word = string[i]
    if (checkurl(word)) {
      word = `<img src="${word}">`
    }
    string[i] = word
  }
  string = string.join(" ")
  
  var nospaceregex = /\"\>(\s)\<img\ssrc\=/g
  var nsstring = string.replace(nospaceregex, '"><ns></ns><img src=')
  return nsstring
}

var connection
var visible
var unread = 0


document.addEventListener( 'visibilitychange' , function() {

  if (document.hidden) {
    visible = false
    console.log("false")
  }
  else {
    // clear tab messages and reset
    console.log("true")
    unread = 0
    visible = true
    $('#title').html('bogchat')
  }
}, false )

var connection

$(function () {
  
  "use strict"
  
  var content = $('#content')
  var input = $('#input')
  var status = $('#status')

  var myColor = false
  var myName = false

  window.WebSocket = window.WebSocket || window.MozWebSocket

  if (!window.WebSocket) {
    content.html($('<p>', { text: 'nosocketsupportsorry'} ))
    input.hide()
    $('span').hide()
    return
  }
  connection = new WebSocket('wss://chat.bog.jollo.org')

  
  connection.onclose = function () {
    console.log("close event received")
  }
  connection.onopen = function () {
    input.removeAttr('disabled')
    status.text('Choose name:')
    if (!localStorage.getItem("nick")) {
      $('#msg').addClass("setnick")
    }
    else {
      myName = localStorage.getItem("nick")
      connection.send(myName)
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
      myColor = json.data
      status.text(myName + ': ').css('color', myColor)
      input.removeAttr('disabled').focus()
    } else if (json.type === 'history') { 
      for (var i=0; i < json.data.length; i++) {
        addMessage(json.data[i].author, imgio(json.data[i].text),
               json.data[i].color, new Date(json.data[i].time))
      }
      $('#content').scrollTop(200000)
    } else if (json.type === 'message') {
      
      if (visible === false) {
        unread++
        $('#title').html(`(${unread}) bogchat`)
      }
      input.removeAttr('disabled')
      addMessage(json.data.author, json.data.text,
        json.data.color, new Date(json.data.time))
      if ( ($('#content').height() - $('#content p:last-of-type').offset().top) < -500 ) {
        // console.log("avoid scrolldown")
      }
      else {
        $('#content').scrollTop(200000)
        setTimeout(function(){$('#content').scrollTop(200000)},300)
        setTimeout(function(){$('#content').scrollTop(200000)},1000)
      }
    } else if ( json.type === "treehouse" ) {
      
    } else {
      console.log('vbadjson: ', json)
    }
  }
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val()
      if (!msg) {
        return
      }
      connection.send(msg)
      $(this).val('') 
      if (myName === false) {
        myName = msg
        localStorage.setItem("nick",msg)
        $('#msg').removeClass("setnick")
      }
    $('#content').scrollTop(200000)
    }
  })
  setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('Error')
      input.attr('disabled', 'disabled').val('badcomm')
    }
  }, 3000)
  function addMessage(author, message, color, dt) {
    content.append(`<p><span class="nick" style="color:${color}">${author}</span>: ${imgio(message)}</p>`)
  }
  window.onload = function() {
    setTimeout(function(){$('#content').scrollTop(200000)},1000);
  }
})

// image uploader

var feedback = function (res) {
  if (res.success === true) {
     connection.send(res.data.link)
  }
}
new Imgur({
  clientid: 'a91768c3de50774',
  callback: feedback
})


// webcam uploader


    var videoopen = false
    var video = document.getElementById('video');
    var localstream
    // Get access to the camera!
    function cameraopen(){
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Not adding `{ audio: true }` since we only want video now
          navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream)
            localstream = stream
            video.play()
          })
      }

      else if (navigator.getUserMedia) { 
          navigator.getUserMedia({ video: true }, function(stream) {
              video.src = stream;
              localstream = stream
              video.play();
          }, errBack);
      } 
      else if (navigator.webkitGetUserMedia) { 
          navigator.webkitGetUserMedia({ video: true }, function(stream){
              video.src = window.webkitURL.createObjectURL(stream);
              localstream = stream
              video.play();
          }, errBack);
      } 
      else if(navigator.mozGetUserMedia) { 
          navigator.mozGetUserMedia({ video: true }, function(stream){
              video.src = window.URL.createObjectURL(stream);
              localstream = stream
              video.play();
          }, errBack);
      }
    }

    // Elements for taking the snapshot
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var video = document.getElementById('video');
    
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
    success: fdone,//calling function which displays url
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
  connection.send(data.data.link)  
}
