function jaztape() {  
  var saveData = (function () {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, fileName) {
  blob = new Blob([data], {type: "octet/stream"}),
  url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  };
  }());

  if (localStorage.getItem("bogbin")) {
  var data = localStorage.getItem("bogbin")
  var fileName = "my.bogbin";

  saveData(data, fileName)
  }
}

var binicon = {
  icons: [1,2,3,4,5,6,7,8],
  geticon: function() {
    let icons = this.icons.shuffle()
    var icon = icons[0]
    this.deleteicon(icon)
    return icon
  },
  swapicon: function(icon) {
    this.puticon(icon)
    return this.geticon()
  },
  puticon: function(icon) {
    this.icons.push(icon)
  },
  deleteicon: function(icon) {
    var index = this.icons.indexOf(icon)
    this.icons.splice(index,1)
    return
  }
};

var bin = {
  loadbin: function(bogbin,id,start,end) {
    if (!start) {
      var start = 0
    }
    if (!end) {
      var end = start + 10
    }
    let use = bogbin.bins[id]
    var name = use.name
    var items = use.items.slice(start,++end)
    var icon = use.icon
    
    return items
    
  },
  loadallbins: function() {
    let bogbin = this.getbin()
    for (key in bogbin.bins) {
      binicon.deleteicon(bogbin.bins[key].icon)
      this.appendbin(key)
    }
  },
  
  appendbin: function(id) {
    let bogbin = this.getbin()
    var thisisactive = ""

    $('#binarea').append('<div data-id="'+id+'" class="bin"><div title="bogbin" data-icon="'+bogbin.bins[id].icon+'" style="background-image:url(./css/image/bin'+bogbin.bins[id].icon+'.png)" class="header"></div><div class="minimize" title="minimize"></div><div title="trash" class="bintrash"></div><div title="hide qwikpik icon" class="showthumb"></div><div class="bincontainer" data-id="'+id+'"></div><input type="text" class="bininput"></input></div>')
    var items = this.loadbin(bogbin,id,0,10)
    for (i=0;i<items.length;i++) {
      $('.bincontainer[data-id="'+id+'"]').append('<img src="'+items[i]+'">')
    }
    if (bogbin.bins[id].qwik == false) {
      console.log("falsex")

      $('body').addClass('xbin'+id)

      $('.bin[data-id="'+id+'"] .showthumb').addClass('active')
    }
    return
  },
  
  createbin: function() {
    var bogbin = this.getbin()
    
    if (Object.keys(bogbin.bins).length >= 8) {
      // shake new icon
      console.log("toomany")
      return
    }
    bogbin.bins[++bogbin.neue] = {
      name: "test",
      items: [],
      icon: binicon.geticon(),
      qwik: true
    }

    this.savebin(bogbin)
    this.appendbin(bogbin.neue)
    bin.qwikbin.refreshicons()
  },
  
  deletebin: function(id) {
    let bogbin = this.getbin()
    // test and see if it has content
    var r = confirm('ARE YOU SURE YOU WANT TO DELETE BOG BIN '+id+'?')
    if (r == true) {
      binicon.puticon(bogbin.bins[id].icon)
      delete bogbin.bins[id]
      this.savebin(bogbin)
      $('.bin[data-id="'+id+'"').addClass("byebye")
      setTimeout(function(){$('.bin[data-id="'+id+'"').remove()},200)
      bindeletemode = false
      $('.bin').removeClass("deletemode")
      $('#deletebinbutton').removeClass("locked")   
      bin.qwikbin.refreshicons()      
    }
  },
  
  getbin: function() {
    if (!localStorage.getItem("bogbin")) {
      console.log("savingbin")
      bin.savebin({neue:0,bins:{}})
    }
    var bogbin = JSON.parse(atob(localStorage.getItem("bogbin")))
    return bogbin
  },
  
  savebin: function(bogbin) {
    localStorage.setItem("bogbin",btoa(JSON.stringify(bogbin)))
    return
  },
  
  qwikbin: {
    
    refreshicons: function() {
      $('.qwikbin').remove()
      $('p img').addClass("readyqwikbin")
      bin.qwikbin.appendall()
    },
    
    appendicons: function() {
      
      let bogbin = bin.getbin()
      $('span.qwikbin.readyqwikbin')
      for (key in bogbin.bins) {
        $('span.qwikbin.readyqwikbin').append('<span class="qwikbinicon" style="background-image:url(./css/image/qwikbin/bin'+bogbin.bins[key].icon+'.png)" data-qwikbin="'+key+'"></span>')
      }
      
      $('span.qwikbin.readyqwikbin').each(function(){
        $(this).removeClass("readyqwikbin")
        $(this).addClass("parsedqwikbin")
      })
      setTimeout(function() {
        $('span.qwikbin.parsedqwikbin').reverseChildren()
        $('span.qwikbin.parsedqwikbin').removeClass("parsedqwikbin")
        $()
      },100)
      
    },
    
    appendall: function() {
      
      $('p img.readyqwikbin').each(function() {
        if ( $(this).width() > 160 && $(this).height() > 50 ) {
          $(this).after('<span class="qwikbin readyqwikbin"></span>')
          $(this).removeClass("readyqwikbin")
          setTimeout(function() {
            bin.qwikbin.appendicons()
          },150)
        }
      })
      
    }
    
  },
  insertintobin: function(content,id) {
    let bogbin = bin.getbin()
    var olditems = bogbin.bins[id].items
    
    if (olditems.indexOf(content) === -1) {
      olditems.push(content)
      $('.bincontainer[data-id="'+id+'"]').prepend('<img src="'+content+'">')
    }
    
    bogbin.bins[id].items = olditems
    bin.savebin(bogbin)
  },
  removefrombin: function(content,id) {
    let bogbin = bin.getbin()
    var olditems = bogbin.bins[id].items
    
    if (olditems.indexOf(content) != -1) {
      var index = olditems.indexOf(content)

      olditems.splice(index,1)

    }
    
    bogbin.bins[id].items = olditems
    bin.savebin(bogbin)    
  },
  toggleshowthumb: function(id) {
    let bogbin = bin.getbin()
    bogbin.bins[id].qwik = !bogbin.bins[id].qwik
    bin.savebin(bogbin)
  }
  
};


  
bin.loadallbins();



$('#newbinbutton').click(function(){
  bin.createbin()
});

var bindeletemode = false;

$('#deletebinbutton').click(function(){
  if ($(this).hasClass("locked")) {
    bindeletemode = false
    $('.bin').removeClass("deletemode")
    $(this).removeClass("locked")
  }
  else {
    bindeletemode = true
    $('.bin').addClass("deletemode")
    $(this).addClass("locked")
  }
})

$('#biggerbinbutton').click(function(){
  if ($(this).hasClass("locked")) {
    $(this).removeClass("locked")
    $('body').removeClass("bigger")
  }
  else {
    $(this).addClass("locked")
    $('body').addClass("bigger")
  }
})

$(document).on('click','.bin',function(){
  if (bindeletemode) {
    var id = $(this).attr("data-id")
    
    bin.deletebin(id)
  }
})

$(document).on('click','.bincontainer img',function(){ 
  if ($('body').hasClass("minibintrashlocked")) {
    
    let url = $(this).attr("src")
    let id = $(this).parent().attr("data-id")
    bin.removefrombin(url,id)
    $(this).remove()
    
  }
  else {
  

  var image = $(this).attr("src"); 
  var oldval = $('#msg #input').val()
  var oldval = `${oldval} ${image} `
  $('#input').val(oldval)  
  }
})


$(document).on('click','.bintrash',function() {
  $('body').toggleClass("minibintrashlocked")
})

$(document).on('click','.bin div.header',function() {
  console.log("swap")
  let id = $(this).parent().attr("data-id")
  $('.qwikbin').removeClass('xbin'+id)
  $('.header').next().next().next().removeClass("active")
  let icon = $(this).attr("data-icon")
  let neueicon = binicon.swapicon(icon)
  let bogbin = bin.getbin()
  bogbin.bins[$(this).parent().attr("data-id")].icon = neueicon
  bin.savebin(bogbin)
  $(this).attr("data-icon",neueicon)
  $(this).css('background-image','url(./css/image/bin'+neueicon+'.png)')
  bin.qwikbin.refreshicons()
})

$(document).on('click','.bin div.minimize',function() {
  $(this).parent().toggleClass("minimize")
})

$(document).on('click','.qwikbinicon',function() {
  
  let image = $(this).parent().prev().attr("data-src")
  let id = $(this).attr("data-qwikbin")
  
  if ($(this).hasClass("qwikpik")) {
    $(this).removeClass("qwikpik")
    bin.removefrombin(image,id)
    $('.bincontainer[data-id="'+id+'"] img[src="'+image+'"]').remove()
  }
  else {
    var i = $(this).parent().parent()
    favpost(i[0].dataset.id)
    $(this).parent().addClass("faved")
    $(this).addClass("qwikpik")
    bin.insertintobin(image,id)    
  }
})

$(document).on('click','#backupbutton',function() {
  jaztape()
})

$(document).on('click','.showthumb',function() {
  let id = $(this).parent().attr("data-id")
  bin.toggleshowthumb(id)
  if ($(this).hasClass("active")) {
    $('body').removeClass('xbin'+id)
    $(this).removeClass("active")
  }
  else {
    $('body').addClass('xbin'+id)
    $(this).addClass('active')
  }
})




