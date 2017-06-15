var modem = {
  
  toggle: () => {
    $('body').toggleClass("modem")
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
  poweron: () => {
    $('#modem').addClass("power")
  },
  poweroff: () => {
    $('#modem').removeClass("power")
  },
  send: null,
  receive: null
}
