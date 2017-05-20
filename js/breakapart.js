var breakapart = {
  inward: ()=> { 
    $('html').removeClass("broken")
  },
  outward: ()=> {
    whatshot()
    $('html').addClass("broken")
  }
};

(function() {

  document.addEventListener("keydown", keydown, false)

  var timer
  var type = ""
  var recover = ""
  var ready = true
  
  function keydown(e) {

    var self = this
    var c = e.code
    
    self.keyscore = self.keyscore || 0
    
    function reset() {
      clearTimeout(timer)
      self.keyscore = 0
      keyready = false
    }
    function clock() {
      keyready = true
      clearTimeout(timer)
      timer = setTimeout(function(){ 
        reset()
      }, 300)
    }
    function delegate(n) {
      if (self.keyscore == 0) {
        if (document.activeElement.tagName == "INPUT" ) {
          recover = document.activeElement.value
        }
        if (n == "KeyA" || n == "Semicolon") {
          type = "inward"
        }
        else if (n == "KeyF" || n == "KeyJ") {
          type = "outward"
        }
      }
    }
    (({
      KeyA: () => {
        delegate(c)
        if (type == "inward" && self.keyscore > 3 ) {
          reset()
        }
        clock()
      },
      KeyS: () => { 
        if (type == "inward" && self.keyscore > 4 ) {
          reset()
        } 
        else if (type == "outward" && self.keyscore > 6 ) {
          reset()
        }   
        clock()
      },
      KeyD: () => { 
        if (type == "inward" && self.keyscore > 6 ) {
          reset()
        }   
        else if (type == "outward" && self.keyscore > 4 ) {
          reset()
        }         
        clock()
      },
      KeyF: () => { 
        delegate(c)
        if (type == "outward" && self.keyscore > 3 ) {
          reset()
        }   
        clock()
      },
      KeyJ: () => { 
        delegate(c)
        if (type == "outward" && self.keyscore > 3 ) {
          reset()
        } 
        clock()
      },
      KeyK: () => { 
        if (type == "inward" && self.keyscore > 6 ) {
          reset()
        } 
        else if (type == "outward" && self.keyscore > 4 ) {
          reset()
        }   
        clock()
      },
      KeyL: () => { 
        if (type == "inward" && self.keyscore > 4 ) {
          reset()
        } 
        else if (type == "outward" && self.keyscore > 6 ) {
          reset()
        }          
        clock()
      },
      Semicolon: () => { 
        delegate(c)
        if (type == "inward" && self.keyscore > 3 ) {
          reset()
        }
        clock()
      },
    })[c] || (() => { reset() } ))()
    
    if (self.keyscore == 7) {
      setTimeout(function() {
        document.activeElement.value = recover
      },100)
      if (type == "inward") {
        breakapart.inward()
      } else {
        breakapart.outward()
      }
      reset()
    }
    else {
      if (keyready) {
        self.keyscore++
      }
    }
  }
})();