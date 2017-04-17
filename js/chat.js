var userlist = [ ]
,   signal = [ ]
,   ibhistory = [""]
,   mentionstar = ""
,   visible, unread = 0
,   unseenfav = 0
,   unseenfavbundle = ""
,   muted, locked = false
,   dragpop = false
,   terminalmode = false
,   joelmode = false
,   joelnormallaunch = false
,   dragcount = false
,   starfoxmode = false
,   readytoremovestored = false
,   ibtemp = ""
,   ibstate = 1
,   tabready = true
,   tabcount = 0
,   lastuserlistarraymatch = 0
,   userlistarraymatch = [ ]
,   messagessplitspaces

if (!localStorage.getItem("muted")) {
  localStorage.setItem("muted", "0")
  muted = false
} else {
  var mutedstatus = localStorage.getItem("muted")
  if (mutedstatus == "1") {
    $('#mutebutton').addClass("muted")
    muted = true
  }
}

function favrequest(e) {
  console.log(e)
}

function addMessage(author, message, color, id) {
  userlist = uniquepush(author, userlist)
  $('#content').append(`<p data-id="${id}"><span class="nick" style="color:${color}">${author.substr(0,16)}</span>: ${richtext(message)}</p>`)
  
}

function addDrumtrack(author, data, image, backgroundcolor, color, id) {
  userlist = uniquepush(author, userlist)
  $('#content').append(`<p data-id="${id}"><span class="nick" style="color:${color}">${author.substr(0,16)}</span>: <span class="pgx" style="background:${color}; background-image:url(${image}); background-size:350px 130px; display:inline-block; border: 8px groove #eaeaea; height:130px; width:350px" data-warble="${data}"><span class="inlineplay"></span><span class="inlinepush"></span></span> </p>`)
}



function storefavitems(id) {
  // if its already set then unset it
  function pushfavbundle(item) {
    var favbundle = []
    if (localStorage.getItem("favbundle")) {
      favbundle = JSON.parse(localStorage.getItem("favbundle"))
    }
    favbundle = uniquepush(item, favbundle)
    localStorage.setItem("favbundle", JSON.stringify(favbundle))
  }
  if ($('p[data-id="' + id + '"]').length > 0) {
    if ($('p[data-id="' + id + '"]').find("img").length > 0) {
      for (i = 0; i < ($('p[data-id="' + id + '"]').find("img").length); i++) {
        pushfavbundle($('p[data-id="' + id + '"]').find("img")[i].src)
      }
    }
  }
}

function richtext(input) {


  function checklinkurl(url) {
    return (url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/) != null)
  }
  var string = input.split(" ")
  for (i = 0; i < string.length; i++) {
    var word = string[i]
    if (checkimgurl(word)) {
      word = `<img class="readyqwikbin" data-src="${word}" draggable="true" onmousedown="showstored(true)" ondrag="dragready()" onmouseup="showstored(false)" ondragend="showstored(false)" src="${word}">`
    } else if (checklinkurl(word)) {
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
  } else {
    return nsstring
  }
}

function hidebabydraw() {
  if ( $('body').hasClass("babydraw")) {
    $('button.coverart').removeClass('active')
    $('body').removeClass("babydraw")
    $('body').removeClass("draw")
  } 
}

function bintoggle() {
      if ($('body').hasClass("terminal")) {
      toggleterminalmode()
    }
    
    
    hidebabydraw()  
    
    if ($('body').hasClass("drum")) {
      $('body').removeClass('drum')
    }
    if ($('body').hasClass("draw")) {
      $('body').removeClass('draw')
    }
    $('body').toggleClass("image")
    $('#binbutton').toggleClass("locked")
}

function togglemute() {
  if ($('#mutebutton').hasClass("muted")) {
    $('#mutebutton').removeClass("muted")
    localStorage.setItem("muted", "0")
    muted = false
  } else {
    muted = true
    $('#mutebutton').addClass("muted")
    localStorage.setItem("muted", "1")
  }
}

function storedtoggle() {
  propagatestored()
  $('#storedarea').toggleClass('makeroom')
  $('#msg #input').toggleClass('makeroom')
  $('html').toggleClass('makeroom')
  $('#r-footer.app-region.active').toggleClass('makeroom')
  $('#trashlock').toggleClass('visible')
  $('#storedarea').removeClass("snip")
  $('#trashlock').removeClass('active')
}

function toggleterminalmode() {
  if (terminalmode) {
    terminalmode = false
    $('body').removeClass("terminal")
  } else {
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
  } else {
    if (joelmode) {
      joelmode = false
      $('#msg #input').removeClass("dark")
    } else {
      joelmode = true
      $('#msg #input').addClass("dark")
    }
  }
}

function dragready() {
  
  if ( !$('body').hasClass("image") ) {
    // peekintoqwikbin
    $('body').addClass("peek")
  }
  
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

function showstored(e) {
  
  
  
  
  if (e) {
    $('#storedinput').addClass('visible')
    $('#storedinput').val('')
    
    $('.bininput').addClass('visible')
    $('.bininput').val('')
    
    
    propagatestored()
  } else {
    $('body').removeClass("peek")
    dragcount = false
    $('#storedinput').removeClass('visible')
    $('.bininput').removeClass('visible')
    if ($('#storedinput').val()) {
      storedpush($('#storedinput').val())
    }
    
    
    $('.bininput').each(function() {
      if ( $(this).val() ) {
        let id = $(this).parent().attr("data-id")
        let val = $(this).val()
        bin.insertintobin(val,id)
        
      }
    })
    
    
    if (dragpop) {
      setTimeout(function() {
        dragpop = false
        $('#storedarea').removeClass('makeroom')
        $('#msg #input').removeClass('makeroom')
      }, 300)
    }
  }
}

function storedpush(e) {
  var oldstored = localStorage.getItem("stored")
  if (!oldstored) {
    oldstored = []
  } else {
    oldstored = JSON.parse(oldstored)
  }
  oldstored.push(e)
  localStorage.setItem("stored", JSON.stringify(oldstored))
  propagatestored(e)
}

function propagatestored(e) {
  if (!this.stored) {
    this.stored = true
    var oldstored = localStorage.getItem("stored")
    if (!oldstored) {
      oldstored = []
      $("#storedcontainer").html('drag images here to use later')
    } else {
      $("#storedcontainer").html('')
      oldstored = JSON.parse(oldstored)
    }
    for (var i = (oldstored.length - 1); i >= 0; i--) {
      $("#storedcontainer").append(`<img src="${oldstored[i]}"> `)
    }
  }
  if (e) {
    $("#storedcontainer").prepend(`<img src="${e}"> `)
  }
}

function favpost(id) {
  storefavitems(id)
  connection.send(JSON.stringify({
    type: "fav",
    data: id
  }))
}

function pushfile() {
  var file = document.getElementById("fileinput").files[0];
  var reader = new FileReader()
  reader.addEventListener("load", function() {
    var base = reader.result
    var firstcomma = base.indexOf(",")
    var base = base.substring((firstcomma + 1), (base.length))
    imagefiletoimgur(base)
  }, false);
  if (file) {
    reader.readAsDataURL(file)
  }
}

var lastword = null
var matchedword = null
// keyboard input binders


$('body').keydown(function(e) {
  if (e.keyCode === 27) {
    
    $('#input').focus()
    $('#input').select()
    if ($('#content').hasClass("starfox")) {
      $('#content').removeClass("starfox")
      starfoxmode = false
      clearbubbles()
    }
  }
});

$('#input').keydown(function(e) {
  var msg = $(this).val()
  if (e.keyCode != 9) {
    tabready = false
  }
  if (e.keyCode === 9) {
    e.preventDefault()
    
    
    if (!tabready) {
      messagessplitspaces = msg.split(" ")
      lastword = messagessplitspaces[messagessplitspaces.length - 1]
      matchedword = null
      userlistarraymatch = [ ]
      if (lastword.length > 0) {
        for (i=0;i<userlist.length;i++) {
          if (userlist[i].toLowerCase().startsWith(lastword.toLowerCase())) {
            userlistarraymatch.push(userlist[i])
          }
        }
        tabready = true
        lastuserlistarraymatch = 0
      }
    }
    if (tabready) {
      if (userlistarraymatch.length == 0) {
        return
      }
      else {
        matchedword = userlistarraymatch[lastuserlistarraymatch]
        messagessplitspaces[messagessplitspaces.length - 1] = matchedword
        var neuemsg = messagessplitspaces.join(" ")
        $(this).val(neuemsg)
        
        lastuserlistarraymatch++
        if (lastuserlistarraymatch >= userlistarraymatch.length) {
          lastuserlistarraymatch=0
        }
      }
      
    }


    
    console.log("> " + matchedword + " " + lastword + " " + lastuserlistarraymatch + " " + userlist.length)

  }
  
  if (e.keyCode === 13) {
    if (!msg) {
      return
    }
    $(this).val('')
    if (myname === false) {
      myname = msg
      localStorage.setItem("nick", msg)
      $('body').removeClass("setnick")
      connection.send(JSON.stringify({
        type: "nick",
        data: msg
      }))
    } else {
      ibtemp = ""
      ibhistory.push(msg)
      ibstate = ibhistory.length
      var x = msg
      var b = msg.trim()
      if (joelmode) {
        if (b.substr(0, 1) == "/") {
          b = b.substr(1, b.length - 1)
        }
        b = b.split(" ")
        var g = b.shift()
        b = b.join(" ")
        bogscript(g, b)
      } else {
        if (b.substr(0, 1) == "/") {
          b = b.substr(1, b.length - 1)
          b = b.split(" ")
          var g = b.shift()
          b = b.join(" ")
          bogscript(g, b)
        } else {
          connection.send(JSON.stringify({
            type: "message",
            data: x
          }))
        }
      }
    }
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
  } else if (e.keyCode === 38) {
    if (ibstate <= 0) {
      $('#msg #input').val("")
    } else if (ibstate == (ibhistory.length)) {
      if (msg == undefined) {
        msg = ""
      }
      ibtemp = msg //value thats in the input box now
      ibstate--
      $('#msg #input').val(ibhistory[ibstate])
    } else {
      ibstate--
      $('#msg #input').val(ibhistory[ibstate])
    }
  } else if (e.keyCode === 40) {
    if (ibstate >= (ibhistory.length)) {
      return // value already in box
    } else {
      ibstate++
      if (ibstate == (ibhistory.length)) {
        $('#msg #input').val(ibtemp)
      } else {
        $('#msg #input').val(ibhistory[ibstate])
      }
    }
  }
})
// live document event binders
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    visible = false
  } else {
    unread = 0
    unseenfavbundle = ""
    unseenfav = 0
    mentionstar = ""
    visible = true
    $('#title').html('bogchat')
  }
}, false)

$(document).on('click', '#storedcontainer img', function(e) {
  var neue = e.toElement.currentSrc
  if (readytoremovestored) {
    $(this).remove()
      // find item in stored array and remove it
    var oldstored = localStorage.getItem("stored")
    if (!oldstored) {
      oldstored = []
    } else {
      oldstored = JSON.parse(oldstored)
    }
    if (oldstored.indexOf(neue) > -1) {
      console.log("match found")
      oldstored.splice(oldstored.indexOf(neue), 1)
      localStorage.setItem("stored", JSON.stringify(oldstored))
    }
  } else {
    var oldval = $('#msg #input').val()
    var oldval = `${oldval} ${neue} `
    $('#input').val(oldval)
  }
})
$(document).on('click', '#uploadbutton', function() {
  $('#fileinput').trigger('click');
})
$(document).on('click', 'p img', function(e) {
  var i = $(this).parent()
  favpost(i[0].dataset.id)
  $(this).parent().addClass("faved")
})
$(document).on('click', 'span.nick', function(e) {
  var i = $(this).parent()
  favpost(i[0].dataset.id)
  $(this).parent().addClass("faved")
})
$(document).on("click", '.favbubble', function() {
    var i = $('#msg #input').val() + " "
    $('#msg #input').val(i + $(this).attr("data-src"))
  })
  // button events
$('#mutebutton').click(function() {
  togglemute()
})
$('#lockbutton').click(function() {
  if ($(this).hasClass("locked")) {
    $('#lockbutton').removeClass("locked")
    $('#uploadbutton').removeClass("locked")
    locked = false
  } else {
    $('#lockbutton').addClass("locked")
    $('#uploadbutton').addClass("locked")
    locked = true
  }
})
$('#storedbutton').click(function() {
  storedtoggle()
})
$('#trashlock').click(function() {
  $(this).toggleClass("active")
  $('#storedarea').toggleClass("snip")
  readytoremovestored = $(this).hasClass("active") ? true : false
})
  // bind scrolling in stored area
function scrollhorizontally(e) {
  e = window.event || e
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
  document.getElementById('storedcontainer').scrollLeft -= (delta * 40)
  e.preventDefault()
}
if (document.getElementById('storedcontainer').addEventListener) {
  document.getElementById('storedcontainer').addEventListener("mousewheel", scrollhorizontally, false)
  document.getElementById('storedcontainer').addEventListener("DOMMouseScroll", scrollhorizontally, false)
} else {
  document.getElementById('storedcontainer').attachEvent("onmousewheel", scrollhorizontally)
}
// final window onload to ensure chat drops to bottom onload
window.onload = function() {
  setTimeout(function() {
    $('#content').scrollTop(200000)
  }, 3000)
  
}

$(document).ready(function() {
  setTimeout(function() {
    bin.qwikbin.appendall()
  },2000)
})