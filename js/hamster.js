var hamster = {
  init: () => {
    $('#hamstercage').append('<img src="http://i.imgur.com/PpPW1Mv.png"><img src="https://bog.jollo.org/css/image/hamu_03.gif"><button id="feedpeach"></button><button id="feedpepper"></button><button id="leavecage"></button>')
    setTimeout(()=>{
      hamster.getfood()
    },2000)
  },
  feedpeach: () => {
    send({
      type: "feedpeach"
    })
  },
  feedpepper: () => {
    send({
      type: "feedpepper"
    })    
  },
  fedpeach: (x) => {
    $('#feedpeach').html(x)
  },
  fedpepper: (x) => {
    $('#feedpepper').html(x)
  },
  getfood: () => {
    send({
      type: "getfood"
    })    
  }
}

hamster.init()

$(document).on("click","#leavecage",function() {
  $('#hamstercage').hide()
})

$(document).on("click","#feedpeach",function() {
  hamster.feedpeach()
})

$(document).on("click","#feedpepper",function() {
  hamster.feedpepper()
})
