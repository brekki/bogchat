var connection, myname

function startwebsocket() {
  "use strict"
  var content = $('#content')
  var input = $('#input')
  var status = $('#status')
  var mycolor = false
  myname = false
  window.WebSocket = window.WebSocket || window.MozWebSocket
  if (!window.WebSocket) {
    content.html($('<p>', {
      text: 'nosocketsupportsorry'
    }))
    input.hide()
    $('span').hide()
    return
  }
  //prod
  connection = new WebSocket('wss://chat.bog.jollo.org')
  connection.onclose = function() {
    console.log("close event received")
  }
  connection.onopen = function() {
    $('#input').removeClass("weaksignal")
    signal = []
    setTimeout(function() {
      $('#content').scrollTop(200000)
    }, 1000)
    setTimeout(function() {
      $('#content').scrollTop(200000)
    }, 2000)
    input.removeAttr('disabled')
    input.val("")
    status.text('choose name:')
    if (!localStorage.getItem("nick")) {
      $('body').addClass("setnick")
    } else {
      myname = localStorage.getItem("nick")
      connection.send(JSON.stringify({
        type: "nick",
        data: myname
      }))
    }
  }
  connection.onerror = function(error) {
    content.html($('<p>', {
      text: 'serverr'
    }))
  }
  connection.onmessage = function(message) {
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
      for (var i = 0; i < json.data.length; i++) {
        addMessage(json.data[i].author, json.data[i].text, json.data[i].color, json.data[i].id)
      }
      $('#content').scrollTop(200000)
    } else if (json.type === 'message') {
      if (visible === false) {
        unread++
        if (json.data.text.includes(myname)) {
          mentionstar = "*"
        }
        $('#title').html(`${mentionstar}(${unseenfavbundle}${unread}) bogchat`)
      }
      input.removeAttr('disabled')
      addMessage(json.data.author, json.data.text, json.data.color, json.data.id)
      if (($('#content').height() - $('#content p:last-of-type').offset().top) < -500) {
        // console.log("avoid scrolldown")
      } else {
        $('#content').scrollTop(200000)
        setTimeout(function() {
          $('#content').scrollTop(200000)
        }, 300)
        setTimeout(function() {
          $('#content').scrollTop(200000)
        }, 1000)
      }
    } else if (json.type === "hi") {
      if (!muted) {
        new Audio('https://bog.jollo.org/au/enter.mp3').play()
      }
    } else if (json.type === "byebye") {
      if (!muted) {
        new Audio('https://bog.jollo.org/au/exit.mp3').play()
      }
    } else if (json.type === "treehouse") {} else if (json.type === "fav") {
      if (visible === false) {
        if ($('p[data-id="' + json.data + '"] span').html() == myname) {
          unseenfav++
          unseenfavbundle = ""
          if (unseenfav > 0) {
            unseenfavbundle = "f" + unseenfav + "/"
          }
          $('#title').html(`${mentionstar}(${unseenfavbundle}${unread}) bogchat`)
        }
      } else {
        $('p[data-id="' + json.data + '"] span').addClass("jiggle")
        setTimeout(function() {
          $('p[data-id="' + json.data + '"] span').removeClass("jiggle")
        }, 300)
      }
    } else if (json.type === "pong") {
      // remove ping from signal [ ]
      // json.data
      signal.pop()
      signal.pop()
    } else {
      console.log('vbadjson: ', json)
    }
  }
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
    setTimeout(function() {
      startwebsocket()
    }, 2000)
  }
}
startwebsocket()

var testsignalstrength = setInterval(function() {
  if (connection.readyState == 1) {
    if (signal.length < 8) { 
      signal.push("ping")
      connection.send(JSON.stringify({type: "ping", data: 0}))
    } 
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