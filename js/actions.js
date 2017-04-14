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
  else if ( a == "nightmode" ) {
    if ($('html').hasClass('day')) {
      $('html').removeClass('day')
    }
    $('html').addClass('night')
  }
  else if ( a == "daymode" ) {
    if ($('html').hasClass('night')) {
      $('html').removeClass('night')
    }
    $('html').addClass('day')
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
    
  } else if ( a == "draw" ) {
    if ($('body').hasClass("terminal")) {
      toggleterminalmode()
    }
    
    if ( $('body').hasClass("babydraw")) {
      $('button.coverart').removeClass('active')
      $('body').removeClass("babydraw")
      $('body').removeClass("draw")
    }    
    
    if ($('body').hasClass("drum")) {
      $('body').removeClass('drum')
    }
    
    $('body').toggleClass("draw")

  } else if ( a == "drums" || a == "drum" ) {

    if ( $('body').hasClass("babydraw")) {
      $('button.coverart').removeClass('active')
      $('body').removeClass("babydraw")
      $('body').removeClass("draw")
    }    
  
    if ($('body').hasClass("terminal")) {
      toggleterminalmode()
    }
    if ($('body').hasClass("draw")) {
      $('body').removeClass('draw')
    }
    $('body').toggleClass("drum")

  } else if ( a == "send" ) {
      // send if the drawing program is open and not if hidden bc term mode
      
    if ( $('body').hasClass("drum") && !$('body').hasClass("terminal")) {
      if ( $('body').hasClass("babydraw")) {
        $('button.coverart').removeClass('active')
        $('body').removeClass("babydraw")
        $('body').removeClass("draw")
      }   
      // need to objectify drum object.. first see if it has an image ---
      uploadtrack($('#includecoverart').prop('checked'))
    }
      
    else if ( $('body').hasClass("draw") && !$('body').hasClass("terminal")) {
      var blobber = $('.drawing-board-canvas')[0].toDataURL("image/png")
      var uri = blobber.substring(22)
      webcamtoimgur(uri)
    }
    
  } else if ( a == "restart" ) {
    var input = $('#msg #input')
    input.removeAttr('disabled')
    input.val("restarting now...")
    setTimeout(function() {
    window.location.href = "https://bog.jollo.org"
    },2000)
  }
  
  else if ( a == "mute" ) {
    togglemute()
  }
  else if ( a == "scrap") {
    storedtoggle()
  }
  else if ( a == "trim" ) {
    $('p img').remove()
  }
  else if ( a == "upload" ) {
    $('#fileinput').trigger('click');
  }


  
}