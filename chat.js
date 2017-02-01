function imgio(input) {
  function checkurl(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }
  var string = input.split(" ")

  for (i=0;i<string.length;i++) {
    var word = string[i]
    if (checkurl(word)) {
      word = '<img src="' + word + '">'
    }
    string[i] = word
  }
  string = string.join(" ")
  return string
}

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
  var connection = new WebSocket('ws://198.211.108.39:1337')

  connection.onopen = function () {
    input.removeAttr('disabled')
    status.text('Choose name:')
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
      console.log("neue message")
      input.removeAttr('disabled')
      addMessage(json.data.author, json.data.text,
             json.data.color, new Date(json.data.time))
             $('#content').scrollTop(200000)
              setTimeout(function(){$('#content').scrollTop(200000)},1000)
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
      }
    $('#content').scrollTop(20000)
    }
  })

  setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('Error')
      input.attr('disabled', 'disabled').val('badcomm')
    }
  }, 3000)

  function addMessage(author, message, color, dt) {
    content.append('<p><span class="nick" style="color:' + color + '">' + author + '</span>'
       + ': ' + imgio(message) + '</p>')
  }
  
  window.onload = function() {
    setTimeout(function(){$('#content').scrollTop(200000)},1000);
  }
  
})