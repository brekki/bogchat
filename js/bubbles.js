// bubble machine

var makingbubbles = false
,   clearingbubbles = false
,   bubblemachinerunning = false
,   bubblecount = 0
,   bubbles = [ ]
,   favbubble = [ ]

function newbubble() {
  
  function bubble() {
    
    if (favbubble.length > 0 && randint(0,3) == 3) {
      this.type = "favbubble"
      this.context = favbubble.pop()
      this.traj = randfloat(0.9,1.3)
      this.y = randint(-260,-200)
          this.opacity = .88
    }
    else {
      this.type = "bubble"
      this.context = null
      this.traj = randfloat(1.5,3)
      this.y = randint(-130,-100)
          this.opacity = 1
    }
    this.life = "alive"
    this.id = bubblecount++
    this.x = randint(-50,(window.innerWidth - 50))
    this.scale = .4
    this.count = 0
    this.deg = randint(45,135)
  }
  
  var bubble = new bubble()
  bubbles.push(bubble)
  
  if (bubble.type == "bubble") {
    $('#container').append(`<div data-bubble="${bubble.id}" style="opacity:${bubble.opacity}; left:${bubble.x}px; bottom:${bubble.y}px" class="bubble pinkbubble"></div>`)
  }
  else if ( bubble.type == "favbubble") {
    $('#container').append(`<div data-src="${bubble.context}" data-bubble="${bubble.id}" style="background-image:url(${bubble.context}); opacity:${bubble.opacity}; left:${bubble.x}px; bottom:${bubble.y}px" class="favbubble"></div>`)    
  }
  
  if (!bubblemachinerunning) {
    bubblemachinerunning = true
    bubblemachine()
  }
}

function makebubbles() {
  function bubblecycle() {
    if (makingbubbles) {
      newbubble()
      if (randint(1,2) == 1) {
        newbubble()
      }
      setTimeout(function(){
        bubblecycle()
      },1000)
    }
  }
  if (!makingbubbles) {
    favbubble = [ ]
    if ( localStorage.getItem("favbundle") ) {
      favbubble = JSON.parse(localStorage.getItem("favbundle")).shuffle()
    }
    makingbubbles = true
    bubblecycle()
  }
}

function clearbubbles() {
  makingbubbles = false
  clearingbubbles = true
}

function bubblemachine() {
  function popbubble(i,id) {
     $('div[data-bubble="'+id+'"]').remove()
     bubbles.splice(i,1)  
  }
  for (i=0;i<bubbles.length;i++) {
    var bubble = bubbles[i]
    bubble.count += 1
    var deg = bubble.deg + randfloat(-2,2)
    var x = bubble.x + xdeg(deg) * bubble.traj
    var y = bubble.y + ydeg(deg) * bubble.traj
    bubble.x = x
    bubble.y = y
    bubble.deg = deg

    if (clearingbubbles) {
      bubble.deg = 270
      bubble.opacity = (randint(1,8) == 8) ? 0 : 1
      bubble.scale = bubble.scale + .012
      if (bubble.opacity <= 0) {
        popbubble(i,bubble.id)          
      }
    }
    // random pop
    if (randint(1,600) == 1 && bubble.type == "bubble") {
       popbubble(i,bubble.id)  
    }
    else {
      $('div[data-bubble="'+bubble.id+'"]').css({transform:"scale("+bubble.scale+")",opacity:bubble.opacity,left:x+"px",bottom:y+"px"})
    }
  }
  if (bubbles.length < 1) {
    bubblemachinerunning = false
    clearingbubbles = false
  }
  if (bubblemachinerunning) {
    setTimeout(function(){bubblemachine()},30)
  }

}
