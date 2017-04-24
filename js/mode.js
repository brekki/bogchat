function setstylesheetbasedontime() {
  var currentTime = new Date().getHours()
  if (0 <= currentTime&&currentTime < 6) {
   if ( !$('html').hasClass("night") ) {
     $('html').addClass("night")
     $('html').removeClass("day")
   }
  }
  else if (6 <= currentTime&&currentTime < 22) {
    if ( !$('html').hasClass("day") ) {
     $('html').addClass("day")
     $('html').removeClass("night")
    }
  }
  else if (22 <= currentTime&&currentTime <= 24) {
    if ( !$('html').hasClass("night") ) {
     $('html').addClass("night")
     $('html').removeClass("day")
    }
  }
}

setstylesheetbasedontime()