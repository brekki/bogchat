if (!localStorage.getItem("modempower")) {
  localStorage.setItem("modempower",JSON.stringify(false))
}
if ( JSON.parse(localStorage.getItem("modempower")) === true ) {
  $('body').addClass("modem")
}
if (!localStorage.getItem("modemcolor")) {
  localStorage.setItem("modemcolor",0)
}

$('#modem').css("filter",'hue-rotate('+localStorage.getItem("modemcolor")+'deg)')



var modem = {
  toggle: () => {
    if ( $('body').hasClass("modem") ) {
      localStorage.setItem("modempower",JSON.stringify(false))
      $('body').removeClass("modem")
    }
    else {
      localStorage.setItem("modempower",JSON.stringify(true))
      $('body').addClass("modem")
    }
  },
  blink: (x) => {
    if ($('body').hasClass("modem")) {
     clearTimeout(modem[x])
     $('#modem').addClass(x)
     modem[x] = setTimeout(() => {
       $('#modem').removeClass(x)
     },50)
    }
  },
  halfblink: (x) => {
    if ($('body').hasClass("modem")) {
     clearTimeout(modem["half"+x])
     $('#modem').addClass("half"+x)
     modem["half"+x] = setTimeout(() => {
       $('#modem').removeClass("half"+x)
     },50)
    }    
  },
  poweron: () => {
    $('#modem').addClass("power")
  },
  poweroff: () => {
    $('#modem').removeClass("power")
  },
  send: null,
  receive: null,
  halfsend: null,
  halfreceive: null,
  resetcolor: () => {
    modem.color(0)
  },
  randcolor: () => {
    modem.color(randint(0,360))
  },
  color: (x) => {
    if (!isNaN(x) && x > -1 && x < 361 ) {
      $('#modem').css("filter",'hue-rotate('+x+'deg)')
      localStorage.setItem("modemcolor",x)
    }
  }
}
