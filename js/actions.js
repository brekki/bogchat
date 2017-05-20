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
    clearInterval(updatestylesheetinterval)
    if ($('html').hasClass('day')) {
      $('html').removeClass('day')
    }
    $('html').addClass('night')
  }
  else if ( a == "daymode" ) {
    clearInterval(updatestylesheetinterval)
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
  
  } else if ( a == "img" || a == "bin" ) {
    
    bintoggle()
    
    
  }


 
  else if ( a == "draw" ) {
    if ($('body').hasClass("terminal")) {
      toggleterminalmode()
    }
    
    hidebabydraw()  
    
    if ($('body').hasClass("drum")) {
      $('body').removeClass('drum')
    }
    if ($('body').hasClass("image")) {
      $('body').removeClass('image')
      $('#binbutton').removeClass("locked")
    }
    
    $('body').toggleClass("draw")

  } else if ( a == "drums" || a == "drum" ) {

    hidebabydraw()   
  
    if ($('body').hasClass("terminal")) {
      toggleterminalmode()
    }
    if ($('body').hasClass("draw")) {
      $('body').removeClass('draw')
    }    
    if ($('body').hasClass("image")) {
      $('body').removeClass('image')
      $('#binbutton').removeClass("locked")
    }

    $('body').toggleClass("drum")

  } else if ( a == "send" ) {
      // send if the drawing program is open and not if hidden bc term mode
      
    if ( $('body').hasClass("drum") && !$('body').hasClass("terminal")) {
      hidebabydraw()   
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
  else if ( a == "jfkjfk" ) {
    $('body').css('background','url("http://i.imgur.com/wkmQwuq.png")')
  }
  else if ( a == "crawl" ) {
    $('html').toggleClass("crawl")
  }
  else if ( a == "quiet" ) {
    $('span.nick').each(function(){
      if ( $(this).html() == b ) {
        $(this).parent().remove()
      }
    })
    uniquepush(b,quiet)
    localStorage.setItem("quiet",JSON.stringify(quiet))
  }
  else if ( a == "unquiet" ) {
    var index = quiet.indexOf(b)
    if (index > -1) {
      quiet.splice(index,1)
    }
    localStorage.setItem("quiet",JSON.stringify(quiet))
  }
  else if ( a == "oper" ) {
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
        connection.send(JSON.stringify({type: "oper", data:{login:n[1]}}))
      }
    }
    else {
      
      var n = b.split(" ")
      if (n[0] == "dec") {
        $('#content span.nick').each(function() {
          var line = $(this).parent().attr("data-id")
          var locale = $(this).attr("data-locale")
          connection.send(JSON.stringify({type: "oper", data:{
            id: atob(localStorage.getItem("oper")), 
            command:"dec "+line+" "+locale
          }}))          
          
        })

      }
      else {
        connection.send(JSON.stringify({type: "oper", data:{id: atob(localStorage.getItem("oper")), command:b}}))
      }
    }
    
    
    
  }


  
}