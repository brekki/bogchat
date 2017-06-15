var connection, myname
var quiet
var radiostatetitle

function isotoseconds(s) {
  var n = s.replace("PT","")
  var sec = 0

  if ( (n.indexOf("H") > -1) && (n.indexOf("S") > -1) && (n.indexOf("M") > -1) ) {
    n = n.split("H").join("x").split("M").join("x").split("S").join("x").split("x")
    sec = parseInt((n[0] * 3600)) + parseInt((n[1] * 60)) + parseInt((n[2]))
  } else if ((n.indexOf("H") > -1) && (n.indexOf("M") > -1)) {
    n = n.split("H").join("x").split("M").join("x").split("x")
    sec = parseInt((n[0] * 3600)) + parseInt((n[1] * 60))
  } else if ((n.indexOf("H") > -1) && (n.indexOf("S") > -1)) {
    n = n.split("H").join("x").split("S").join("x").split("x")
    sec = parseInt((n[0] * 3600)) + parseInt(n[1])
  } else if ((n.indexOf("M") > -1) && (n.indexOf("S") > -1)) {
    n = n.split("M").join("x").split("S").join("x").split("x")
    sec = parseInt((n[0] * 60),10) + parseInt(n[1])
  } else if ((n.indexOf("H") > -1)) {
    n = n.split("H").join("x").split("x")
    sec = parseInt(n[0] * 3600)
  } else if ((n.indexOf("M") > -1)) {
    n = n.split("M").join("x").split("x")
    sec = parseInt(n[0] * 60)
  } else if ((n.indexOf("S") > -1)) {
    n = n.split("S").join("x").split("x")
    sec = parseInt(n[0])
  }
  return sec
}

var lastdoomsound = 0

function doomsounds(enter) {
  var ctime = (+new Date())
  if ((ctime - lastdoomsound) > 10000) {
    lastdoomsound = ctime
    if (enter) {
      if (!$('#mutebutton').hasClass("doommute")) {
        new Audio('https://bog.jollo.org/au/enter.mp3').play()
      }    
    }
    else {
      if (!$('#mutebutton').hasClass("doommute")) {
        new Audio('https://bog.jollo.org/au/exit.mp3').play()
      }    
    }    
  }
}

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
    modem.poweroff()
    console.log("close event received")
  }
  connection.onopen = function() {
    modem.poweron()
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
      send({
        type: "nick",
        data: myname
      })
    }
    setTimeout(function() {
      console.log("radio request")
      send({
        type: "radio"
      })     
    },1500)
  }
  connection.onerror = function(error) {
    content.html($('<p>', {
      text: 'serverr'
    }))
  }
  connection.onmessage = function(message) {
    if (modem) {
      modem.blink("receive")
    }
    try {
      var json = JSON.parse(message.data)
    } catch (e) {
      console.log('badjson: ', message.data)
      return
    }
    
    ;(({
      color: () => {
        mycolor = json.data
        status.text(myname + ': ').css('color', mycolor)
        input.removeAttr('disabled').focus()
      },
      history: () => {
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
      },
      message: () => {
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
        );
      },
      hi: () => {
        doomsounds(true)
      },
      byebye: () => {
        doomsounds()
      },
      whatshot: () => {
        var whatshotescape = function(html) {
          return html.replace(/&/g, '&amp;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        }
        if ( $('#whatshot').html().length == 0 ) {
          // propagate whatshot with images
          console.log(json.data)
          for (var key in json.data) {
            console.log(json.data[key].context)
            if ( $('#whatshot .whatshot'+json.data[key].postid).length == 0 ) {
              $('#whatshot').append('<div class="whatshot'+json.data[key].postid+'"><span>'+whatshotescape(json.data[key].username)+'</span></div>')
            }
            $('#whatshot .whatshot'+json.data[key].postid).append('<img src="'+json.data[key].context+'"></img>')
          }
        }
      },
      treehouse: () => {
        
      },
      drum: () => {
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
      },
      fav: () => {
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
          if ($('p[data-id="' + json.data + '"] span').html() == myname) {
            if (!$('#mutebutton').hasClass("frogmute")) {
              favchime()
            }
          }
          $('p[data-id="' + json.data + '"] span').addClass("jiggle")
          setTimeout(function() {
            $('p[data-id="' + json.data + '"] span').removeClass("jiggle")
          }, 300)
        }
      },
      pong: () => {
        signal.pop()
        signal.pop()
      },
      decreq: () => {
        var id = json.data.id
        var req = json.data.req
        if ($('p[data-id="'+id+'"]').hasClass("ok")) {
          // snub
        }
        else {
          $('p[data-id="'+id+'"]').addClass("ok")
          $('p[data-id="'+id+'"] span').html("<span>("+req+") </span>" + $('p[data-id="'+id+'"] span').html())
        }
      },
      live: () => {
        live.create()
      },
      list: () => {
        console.log(json.data)
      },
      oper: () => {
        if (json.data.type == "login") {
          
          $('#input').val(json.data.message)
          localStorage.setItem("oper",btoa(json.data.content))
          //localStorage.setItem("key",btoa(json.data.aes))
          $('#input').attr("disabled","disabled")
          setTimeout(function(){
            $('#input').val("")
            $('#input').removeAttr("disabled")
          },3800)
        }
      },
      radio: () => {
        (({
          power: () => {
            //console.log("power")
            if (json.power) {
              if (json.power == "playing") {
                $('html').addClass("radioready")
              }
              else {
                $('html').removeClass("radioready")
                radiohudmarquee.feed(" ")
                $('#radioremain').html("x0")
              }
            }
          },
          track: () => {
            //console.log("track")
            if (json.track.ctime) {
              var radioserverctime = json.track.ctime
              console.log("ctimeserver " + radioserverctime)
              if (json.track.duration) {
                youtubetrackready = true
                var duration = json.track.duration
                var trackinseconds = isotoseconds(duration)
                console.log("duration " + duration)
                console.log("trackinseconds " + trackinseconds)
                var radiolocalctime = + new Date();
                var offset = ((radioserverctime - radiolocalctime) / 1000)
                var remaining = trackinseconds + offset
                radiohudtimer.feed(remaining)
                radiohudtimer.data.uptick = (parseInt(offset,10) * -1)
              }
              else {
                youtubetrackready = false
                $('#radioledactive').html("")
              }
            }
            else {
              youtubetrackready = false
              $('#radioledactive').html("")
            }
            radiostateurl = json.track.url
            radiostatetitle = json.track.title
            console.log("radiostatetitle " + radiostatetitle)
            radiohudmarquee.feed(json.track.title)
          },
          playlist: () => {
            // received payload && possible current track
            console.log(json)
            if (json.playlist 
            && json.playlist.playlist 
            && json.playlist.playlist.tracks) {
              ejectplayer.data.tracks = json.playlist.playlist.tracks
            }
            if (json.playlist 
            && json.playlist.playlist 
            && json.playlist.playlist.current_track 
            && json.playlist.playlist.current_track.filename) {
              ejectplayer.data.currenttrackfilename = json.playlist.playlist.current_track.filename
            }
            ejectplayer.clear()
            ejectplayer.build()
          },
          remain: () => {
            //console.log("remain")
            //console.log(json)
            $('#radioqueueloading').removeClass("viz")
            $('#radiominremain').html("x" + json.remain)
          }
        })[json.payload] || (() => { console.log("bad json") } ))()
      },
      //status: () => {
      //  $('#input').val(json.data)
      //  localStorage.setItem("oper",btoa(json.data.content))
      //  //localStorage.setItem("key",btoa(json.data.aes))
      //  $('#input').attr("disabled","disabled")
      //  setTimeout(function(){
      //    $('#input').val("")
      //    $('#input').removeAttr("disabled").focus()
      //    
      //    },400);
      //},
    })[json.type] || (() => { console.log("bad json") } ))();
    
  }
  var trybadcomm = setInterval(function() {
    if (connection.readyState !== 1) {
      status.text('error..')
      input.attr('disabled', 'disabled').val('badcomm')
      connection.close()
      modem.poweroff()
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
  send({type: "whatshot", data: 0})
}

var testsignalstrength = setInterval(function() {
  if (connection.readyState == 1) {
    if (signal.length < 8) { 
      signal.push("ping")
      send({type: "ping", data: 0})
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

