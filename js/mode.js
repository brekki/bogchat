function getStylesheet() {
  var currentTime = new Date().getHours()
  if (0 <= currentTime&&currentTime < 6) {
   $('html').addClass("night")
  }
  else if (6 <= currentTime&&currentTime < 22) {
   $('html').addClass("day")
  }
  else if (22 <= currentTime&&currentTime <= 24) {
   $('html').addClass("night")
  }
}

getStylesheet()