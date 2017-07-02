var search = {
  lastquery: null,
  init: (b) => {
    if ($('#searchbar img').length == 0 && !$('html').hasClass("search") && $('#searchbar > div').length == 0) {
      search.affixtools()
    }
    if (!b) {
        $('html').toggleClass("search")
        return
      }
    $('html').addClass("search")
    console.log(b)
    search.lastquery = b
    send({type:'queryuser',data:b})
  },
  prependall: (chunk) => {
    console.log("here")
    for (var u=0;u<chunk.length;u++) {
      search.prepend(chunk[u].context)
    }
  },
  prepend: (url) => {
    $('#searchbar').prepend('<img data-url="'+url+'" src="'+url+'">')
  },
  affixtools: () => {
    $('#searchbar').prepend('<div class="tool minimize"></div><div class="tool clear"></div><div class="tool more">')
  },
  clear: () => {
    $('#searchbar').html("")
    search.affixtools()
  }
}

function scrollsearchhorizontally(e) {
  e = window.event || e
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
  document.getElementById('searchbar').scrollLeft -= (delta * 40)
  e.preventDefault()
}

if (document.getElementById('searchbar').addEventListener) {
  document.getElementById('searchbar').addEventListener("mousewheel", scrollsearchhorizontally, false)
  document.getElementById('searchbar').addEventListener("DOMMouseScroll", scrollsearchhorizontally, false)
} else {
  document.getElementById('searchbar').attachEvent("onmousewheel", scrollsearchhorizontally)
}

$(document).on("click","#searchbar img",(e)=>{
  var neue = e.toElement.currentSrc
  var oldval = $('#msg #input').val()
  var oldval = `${oldval} ${neue} `
  $('#input').val(oldval)  
})

$(document).on("click","#searchbar .more",()=>{
  if (search.lastquery) {
    bogscript("search",search.lastquery)
  }
})

$(document).on("click","#searchbar .minimize",()=>{
  $('html').removeClass("search")
})

$(document).on("click","#searchbar .clear",()=>{
  search.clear()
})
