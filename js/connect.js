var connection, myname
var quiet



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
  //connection = new WebSocket('ws://104.236.50.22:2338')
  
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
        if (json.data[i].drum) {
          if (isJSON(atob(json.data[i].text))) {
            var data = JSON.parse(atob(json.data[i].text))
            var image = data.image
            var backgroundcolor = data.color
            var ytid = null

            if (data.includeyt) {
              if (data.includeyt === true ) {
                if (data.ytsync === false) {
                  if (data.yturl) {
                    var thisid = validateyoutubeurl(data.yturl)
                    if ( thisid[0] === true ) {
                      ytid = thisid[1]
                    }
                  } 
                }
              }
            }
            var locale = (data.locale ) ? data.locale : ""
            addDrumtrack(locale, json.data[i].author, json.data[i].text, image, backgroundcolor, json.data[i].color, json.data[i].id, ytid)
          }
        }
        else {
          var locale = (json.data[i].locale ) ? json.data[i].locale : ""
          var zoo = (json.data[i].zoo ) ? json.data[i].zoo : ""
          addMessage(locale, json.data[i].author, json.data[i].text, json.data[i].color, json.data[i].id, json.data[i].zoo)
        }
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
      var locale = (json.data.locale ) ? json.data.locale : ""
      var zoo = (json.data.zoo ) ? json.data.zoo : ""
      addMessage(locale, json.data.author, json.data.text, json.data.color, json.data.id, json.data.zoo)
      setTimeout(function() {
        if ( ($('#content p:last-of-type').offset().top - $('#content').height()) > 100 ) {
          // console.log("avoid scrolldown")
        } 
        else {
          $('#content').scrollTop(200000)
          setTimeout(function() {
            $('#content').scrollTop(200000)
          }, 300)
          setTimeout(function() {
            $('#content').scrollTop(200000)
          }, 1000)
        }
      },100)
      setTimeout(function() {
        bin.qwikbin.appendall()},500
      )
    } else if (json.type === "hi") {
      if (!muted) {
        new Audio('https://bog.jollo.org/au/enter.mp3').play()
      }
    } else if (json.type === "byebye") {
      if (!muted) {
        new Audio('https://bog.jollo.org/au/exit.mp3').play()
      }
    } else if (json.type === "whatshot") {
      
      var whatshotescape = function(html) {
        return html.replace(/&/g, '&amp;')
          .replace(/>/g, '&gt;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        }
      
      console.log(json.data)
      if ( $('#whatshot').html().length == 0 ) {
        // propagate whatshot with images
        for (key in json.data) {
          console.log(json.data[key].context)
          if ( $('#whatshot .whatshot'+json.data[key].postid).length == 0 ) {
            $('#whatshot').append('<div class="whatshot'+json.data[key].postid+'"><span>'+whatshotescape(json.data[key].username)+'</span></div>')
          }
          $('#whatshot .whatshot'+json.data[key].postid).append('<img src="'+json.data[key].context+'"></img>')
        }
      }
      
    } else if (json.type === "treehouse") {
      
    } else if (json.type === "drum" ) {
    
      if (isJSON(atob(json.data.text))) {
        var data = JSON.parse(atob(json.data.text))
        var image = data.image
        var backgroundcolor = data.color
        var locale = (data.locale) ? data.locale : ""
        addDrumtrack(locale, json.data.author, json.data.text, image, backgroundcolor, json.data.color, json.data.id)
      }
          $('#content').scrollTop(200000)
          setTimeout(function() {
            $('#content').scrollTop(200000)
          }, 300)
      
    } else if (json.type === "fav") {
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
      
      
    } 
    else if (json.type === "decreq") {
      var id = json.data.id
      var req = json.data.req
      if ($('p[data-id="'+id+'"]').hasClass("ok")) {
        // snub
      }
      else {
        $('p[data-id="'+id+'"]').addClass("ok")
        $('p[data-id="'+id+'"] span').html("<span>("+req+") </span>" + $('p[data-id="'+id+'"] span').html())
      }
    }
    else if (json.type === "list") {
      console.log(json.data)
    }
    else if (json.type === "oper") {
      if (json.data.type == "login") {
        
        $('#input').val(json.data.message)
        localStorage.setItem("oper",btoa(json.data.content))
        //localStorage.setItem("key",btoa(json.data.aes))
        $('#input').attr("disabled","disabled")
        setTimeout(function(){
          $('#input').val("")
          $('#input').removeAttr("disabled")
          
          },3800)
        
        
        console.log("logged in")
      }
      
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

var whatshot = function() {
  connection.send(JSON.stringify({type: "whatshot", data: 0}))
}

var testsignalstrength = setInterval(function() {
  if (connection.readyState == 1) {
    if (signal.length < 8) { 
      signal.push("ping")
      connection.send(JSON.stringify({type: "ping", data: 0}))
    } 
  }
  if (signal.length > 3 ) {
    $('#input').addClass("weaksignal")
  }
  else {
    if ($('#input').hasClass("weaksignal")) {
      $('#input').removeClass("weaksignal")
    }
  }
}, 2000)

