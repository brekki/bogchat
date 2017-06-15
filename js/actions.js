function bogscript(a,b) {
  

  // a = action
  // b = optional data
  console.log(`action: ${a}, context: ${b}`);

  
  (({
    fav: () => {
      if (!b) {
        var lastimgdataid = $("#content").find("img:last").parent().attr("data-id")
        favpost(lastimgdataid)
      }
      else {
        var bb = b.split(" ")
        var nick = $("#content").find('span:contains("' + bb[0] + '"):last').parent().attr("data-id")
        if (nick) {
          favpost(nick)
        }
      }  
    },
    nightmode: () => {
      clearInterval(updatestylesheetinterval)
      if ($('html').hasClass('day')) {
        $('html').removeClass('day')
      }
      $('html').addClass('night')
    },
    daymode: () => {
      clearInterval(updatestylesheetinterval)
      if ($('html').hasClass('night')) {
        $('html').removeClass('night')
      }
      $('html').addClass('day')
    },
    clear: () => {
      $('#content').html('')
    },
    msg: () => {
      if (b) {
        send({type: "message", data: b})
      }
    },
    starfox: () => {
      starfoxtoggle()
    },
    "/": () => {
      starfoxtoggle()
    },
    img: () => {
      bintoggle()
    },
    bin: () => {
      bintoggle()
    },
    //fidget: () => {
    //  // init fidget spinner
    //  document.write('<link rel="stylesheet" href="https://bog.jollo.org/css/fidget.css" type="text/css">')
    //  document.write('<script src="https://bog.jollo.org/js/fidget.js"><\/script>')
    //},
    draw: () => {
      hidebabydraw()  
      if ($('body').hasClass("drum")) {
        $('body').removeClass('drum')
      }
      if ($('body').hasClass("image")) {
        $('body').removeClass('image')
        $('#binbutton').removeClass("locked")
      }
      $('body').toggleClass("draw")
    },
    drum: () => {
      drumviewtoggle()
    },
    drums: () => {
      drumviewtoggle()
    },
    send: () => {
      if ( $('body').hasClass("drum") ) {
        hidebabydraw()   
        uploadtrack($('#includecoverart').prop('checked'))
      }
      else if ( $('body').hasClass("draw") ) {
        var blobber = $('.drawing-board-canvas')[0].toDataURL("image/png")
        var uri = blobber.substring(22)
        webcamtoimgur(uri)
      }
    },
    restart: () => {
      var input = $('#msg #input')
      input.removeAttr('disabled')
      input.val("restarting now...")
      setTimeout(function() {
      window.location.href = "https://bog.jollo.org"
      },2000)
    },
    mute: () => {
      togglemute()
    },
    modem: () => {
      $('body').toggleClass("modem")
    },
    scrap: () => {
      storedtoggle()
    },
    radio: () => {
      if (!b) {
        // toggleradio
        console.log("x")
        return
      }
      $('#radioqueueloading').addClass("viz")
      send({type:"radioqueue", data: b})
      console.log("y")
    },
    trim: () => {
      $('p img').remove()
    },
    upload: () => {
      $('#fileinput').trigger('click');
    },
    jfkjfk: () => {
      $('body').css('background','url("http://i.imgur.com/wkmQwuq.png")')
    },
    crawl: () => {
      live.clear()
    },
    live: () => {
      live.create()
    },
    chime: () => {
      $('html').toggleClass("chime")
    },
    quiet: () => {
      $('span.nick').each(function(){
        if ( $(this).html() == b ) {
          $(this).parent().remove()
        }
      })
      uniquepush(b,quiet)
      localStorage.setItem("quiet",JSON.stringify(quiet))
    },
    unquiet: () => {
      var index = quiet.indexOf(b)
      if (index > -1) {
        quiet.splice(index,1)
      }
      localStorage.setItem("quiet",JSON.stringify(quiet))
    },
    oper: () => {
      if (!b) {
        if (!localStorage.getItem("oper")) {
          $('#input').val("not logged in..")
          setTimeout(function(){$('#input').val("")},800)        
        }
        else {
          $('#input').val("logged in..")
          setTimeout(function(){$('#input').val("")},800)           
        }
        return
      }
      if (!localStorage.getItem("oper")) {
        var n = b.split(" ")
        if (n[0] !== "pass") {
          $('#input').val("not logged in..")
          setTimeout(function(){$('#input').val("")},1650)
        }
        else {
          send({type: "oper", data:{login:n[1]}})
        }
      }
      else {
        var n = b.split(" ")
        if (n[0] == "dec") {
          $('#content span.nick').each(function() {
            var line = $(this).parent().attr("data-id")
            var locale = $(this).attr("data-locale")
            send({type: "oper", data:{
              id: atob(localStorage.getItem("oper")), 
              command:"dec "+line+" "+locale
            }})        
          })
        }
        else {
          send({type:"oper", data:{id: atob(localStorage.getItem("oper")), command:b}})
        }
      }
    },

  })[a] || (() => {  } ))()
  
  function starfoxtoggle() {
    if ($('#content').hasClass("starfox")) {
      $('#content').removeClass("starfox")
      starfoxmode = false
      clearbubbles()
    }
    else {
      starfoxmode = true
      $('#content').addClass("starfox")
      makebubbles()     
    }
  }
  
  function drumviewtoggle() {
    hidebabydraw()   
    if ($('body').hasClass("draw")) {
      $('body').removeClass('draw')
    }    
    if ($('body').hasClass("image")) {
      $('body').removeClass('image')
      $('#binbutton').removeClass("locked")
    }
    $('body').toggleClass("drum")
  }
}