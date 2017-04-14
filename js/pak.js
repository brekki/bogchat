var livepak = "default"

function learnpak(e) {
  $('input[value="'+e+'"]').prop('checked',true)
  livepak = e
}

function pakmenu(pak) {
  

  
  if (pak == livepak) {
    return
  }
  
  console.log("switching pak")
  
  livepak = pak

  function pikpak(e) {

    var paks = ({
    
      "default": ['kick', 'snare', 'openHat', 'closedHat', "conga", "clap", "stick"],
      "ffog": ['ffog15', 'ffogBASS-Synthbazzz', 'ffogBD-dx200-RotterdamGabberKick', 'ffogDR660Anvil', "ffogDR660hiups", "ffogMD16_SD_Killa_3", "ffogVibraphoneHi-MT70"]
      
    })[e] || []
    
    var pattern = {}
    for (a=0;a<paks.length;a++) {
      pattern[paks[a]] = Array(65).join("0")
    }
    
    return pattern
  }
  new Audio('https://bog.jollo.org/au/pak.wav').play()

  var createpak = pikpak(pak)

  var newpak = {}
  newpak["sequence"] = createpak
  

  dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_PATTERN, newpak);
  dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_STOP)

  function seqnoteblip() {
    seqnoteblip.n = seqnoteblip.n || 0
    $('.seq-row span').each(function(){
      if (Math.random() > .66) {
        $(this).toggleClass('seq-note')
      }
    })
    
    seqnoteblip.n++
    if ( seqnoteblip.n > 2 ) {
      $('span.seq-note').removeClass("seq-note")
      seqnoteblip.n = 0
    } else {
      setTimeout(function(){seqnoteblip()},100)
    }
  }
  seqnoteblip()
}

/* event binder */

$(document).on('click','#pikpak input',function() {
  pakmenu($(this).val())
})