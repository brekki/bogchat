var live = {
  create: () => {
    $('#crawl').html('<iframe src="crawl"></iframe>')
    $('html').addClass("crawl")
    setTimeout(function() {
      $('#content').scrollTop(200000)
    }, 1000)  
  },
  clear: () => {
    $('#crawl').html("")
    $('html').toggleClass("crawl")  
  }
}