var _currentPatternSequenceRaw;
var currentPattern = null
var tempPattern = null
var tempTempo = null
var presets

function propagatepresets() {
  var oldstored = localStorage.getItem("tapedeck")
  if (!oldstored) {
    presets = {}
  } else {
    presets = JSON.parse(atob(oldstored))
  }
  return
}

function uploadtrack(includecoverart) {
  if (includecoverart) {
    var blobber = $('.drawing-board-canvas')[0].toDataURL("image/png")
    var uri = blobber.substring(22)
    coverarttoimgur(uri)
  } else {
    uploadtrackfull(false)
  }
}

function uploadtrackfull(data) {
  if (data) {
    var image = data.data.link
  } else {
    var image = null
  }
  var color = randcolor()
  var bordercolor = randcolor()
  var bundle = {}

  function buildsequence() {
    var sequence = {}
    for (e in currentPattern) {
      var a = ""
      for (n = 0; n < currentPattern[e].length; n++) {
        a += currentPattern[e][n].toString()
      }
      sequence[e] = a
    }
    return sequence
  }
  var bundle = {
    tempo: $('.transport-tempo').val(),
    type: 'drummachine',
    version: 1,
    name: 'drumtrack',
    author: myname,
    image: image,
    color: color,
    bordercolor: bordercolor,
    sequence: buildsequence()
  }
  var bundlestring = btoa(JSON.stringify(bundle))
  console.log(bundlestring)
  connection.send(JSON.stringify({
    type: "drum",
    data: bundlestring
  }))
}

function handletape(command, data) {
  console.log("data")
  if (isJSON(atob(data))) {
    var context = JSON.parse(atob(data))
    if (context.type == "drummachine") {
      var type = "drummachine"
      if (!isNaN(context.tempo)) {
        if (context.tempo >= 1 && context.tempo < 1000) {
          var tempo = Math.floor(context.tempo)
        } else {
          return
        }
      } else {
        return
      }
      if (context.author.length < 100) {
        var author = context.author
      } else {
        return
      }
      var sequence = context.sequence
      if (!sequence) {
        return
      }
    } else {
      console.log("k");
      return
    }
    if (context.image) {
      if (checkimgurl(context.image)) {
        var image = context.image
      } else {
        return
      }
    } else if (context.image === null) {
      var image = null
    } else {
      return
    }
    if (context.color) {
      if (context.color.length == 7) {
        var color = context.color
      } else {
        return
      }
    } else {
      return
    }
    if (context.bordercolor) {
      if (context.bordercolor.length == 7) {
        var bordercolor = context.bordercolor
      } else {
        return
      }
    } else {
      return
    }
    if (command == "play") {
      console.log("set play")
      var n = {}
      console.log(sequence)
      console.log
      for (key in sequence) {
        n[key] = []
        for (e = 0; e < sequence[key].length; e++) {
          n[key].push(sequence[key][e])
        }
      }
      console.log(n)
      currentPattern = n
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_TEMPO, tempo);
      dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_PLAY)
    } else if (command == "push") {
      pushnewtape(type, tempo, author, sequence, color, bordercolor, image)
    }
  } else {
    return
  }
}

function pushnewtape(type, tempo, author, sequence, color, bordercolor, image) {
  // need to make sure all this information is valid json and valid drum data
  console.log("pushnewtape" + type + tempo + author + sequence + color + bordercolor + image)
  var oldstored = localStorage.getItem("tapedeck")
  if (!oldstored) {
    oldstored = {}
  } else {
    oldstored = JSON.parse(atob(oldstored))
  }
  var count = Object.keys(oldstored).length

  function tape() {
    this.type = type
    this.tempo = tempo
    this.author = author
    this.sequence = sequence
    this.image = image
    this.color = color
    this.bordercolor = bordercolor
    this.name = "drumtrack"
  }
  oldstored[count] = new tape()
  localStorage.setItem("tapedeck", btoa(JSON.stringify(oldstored)))
  propagatepresets()
  $('ul.control.presets.menu').append(`<li style="background:${color}; border:2px solid ${bordercolor}; background-image:url(${image}); background-size: 52px 13px;"><a style="cursor:pointer" role="button" data-preset-id="${count}">drumtrack</a></li>`)
}

var AUDIO = new(window.AudioContext || window.webkitAudioContext)();
var dispatcher = _.extend({
  'EventKeys': {},
  register: function(eventHash) {
    for (var k in eventHash) {
      if (k in this.EventKeys) throw 'Dispatcher error: duplicate event key: ' + k;
      this.EventKeys[k] = eventHash[k];
    }
  }
}, Backbone.Events);
/**
 * Sample bank.  Loads and maintains sound sources
 * and responds to requests to play them.
 **/
var SampleBank = (function(A) {
  var bank = {},
    loadCount = 0,
    totalCount = 0;
  /**
   * Resource loading
   **/
  function loadSamples(srcObj, callback) {
    for (var k in srcObj) {
      totalCount++;
    }
    for (var k in srcObj) {
      _loadSample(k, srcObj[k]);
    }
    _onSamplesLoaded = callback;
  }

  function _onSamplesLoaded() {
    console.warn('Need to pass a callback to load()');
  }

  function _handleSampleLoad(key, buffer) {
    if (!buffer) {
      console.error('Unable to decode audio file', url);
      return;
    }
    bank[key] = buffer;
    if (++loadCount == totalCount) _onSamplesLoaded();
  }

  function _loadSample(key, url) {
    var req = new XMLHttpRequest();
    req.responseType = "arraybuffer";
    req.onload = function() {
      A.decodeAudioData(req.response, function(b) {
        _handleSampleLoad(key, b);
      }, function(err) {
        console.error('Unable to decode audio data', err);
      });
    }
    req.onerror = function(err) {
      console.error('Error loading sample data', key, url, err);
    }
    req.open('GET', url, true);
    req.send();
  }
  /**
   * Resource playing
   **/
  function playSample(id, when) {
    var s = A.createBufferSource();
    s.buffer = bank[id];
    s.connect(A.destination);
    s.start(when || 0);
  }
  var API = {
    play: playSample,
    init: loadSamples
  };
  return API;
})(AUDIO);


function swaptracks(stop) {
  if (!tempPattern) {
    console.log("setting")
    tempTempo = $('.transport-tempo').val()
    tempPattern = currentPattern
      //console.log(currentPattern)
      //console.log(tempPattern)
  }
  if (stop) {
    currentPattern = tempPattern
    tempPattern = null
    $('.transport-tempo').val(tempTempo)
    dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_TEMPO, tempTempo);
    tempTempo = null
  }
}
/**
 * Sequencer
 **/
var Sequencer = (function(A, S) {
  var evs = {
    SEQUENCER_PLAY: 'sequencer:play',
    SEQUENCER_STOP: 'sequencer:stop',
    SEQUENCER_SET_PATTERN: 'sequencer:setpattern',
    SEQUENCER_PATTERN_CHANGED: 'sequencer:patternchanged',
    SEQUENCER_STEP: 'sequencer:step',
    SEQUENCER_NOTE_PLAY: 'sequencer:noteplay'
  };
  var tempo, tic, _initialized = false;
  var noteTime, startTime, ti, currentStep = 0;
  var isPlaying = false;
  var channelStatus = {};

  function setTempo(newTempo) {
    tempo = newTempo;
    tic = (60 / tempo) / 4; // 16th
  }
  /* Scheduling */
  function scheduleNote() {
    if (!isPlaying) return false;
    var ct = A.currentTime;
    ct -= startTime;
    while (noteTime < ct + 0.200) {
      var pt = noteTime + startTime;
      playPatternStepAtTime(pt);
      nextNote();
    }
    ti = setTimeout(scheduleNote, 0);
  }

  function nextNote() {
    currentStep++;
    if (currentStep == 64) currentStep = 0;
    noteTime += tic;
  }

  function playPatternStepAtTime(pt) {
    for (var k in currentPattern) {
      if (channelStatus[k] !== false && currentPattern[k][currentStep] == "1") {
        S.play(k, pt);
        dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_NOTE_PLAY, k);
      }
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_STEP, currentStep);
    }
  }
  /* Parsing */
  function playPattern(pattern, loops) {
    if (!_initialized) throw ('Sequencer not initialized');
    if (currentPattern === null) _parsePattern(pattern);
    if (loops === undefined) loops = 1;
    if (loops === -1) loops = Number.MAX_INT;
    play();
  }

  function _parsePattern(pattern) {
    currentPattern = {};
    _currentPatternSequenceRaw = _.extend(pattern.sequence, {});
    for (var k in pattern.sequence) {
      var pat = _parseLine(pattern.sequence[k]);
      currentPattern[k] = pat;
    }
  }

  function _parseLine(line) {
    if (line.length !== 64) console.error('Invalid line length', pattern);
    return line.split('');
  }
  /** Transport **/
  function play() {
    isPlaying = true;
    noteTime = 0.0;
    startTime = A.currentTime + 0.005;
    scheduleNote();
  }

  function stop() {
    isPlaying = false;
    currentStep = 0;
    dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_STEP, currentStep);
  }

  function changeChannelActiveStatus(channel, status) {
    channelStatus[channel] = status;
  }
  var _template = Handlebars.compile('\
    <div class="module sequencer">\
      <div class="sequencer-channels">\
			{{#each channels}}\
				<div class="channel" data-inst="{{ this }}"></div>\
				<div class="sep"></div>\
			{{/each}}\
 			</div>\
    </div>');
  var SequencerView = Backbone.View.extend({
    channelViews: {},
    initialize: function(options) {
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_PLAY, playPattern);
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_STOP, this.stop);
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_SET_PATTERN, this.setPattern);
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_SET_TEMPO, setTempo);
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_STEP, this.setPlayhead);
      this.listenTo(dispatcher, dispatcher.EventKeys.SEQUENCER_NOTE_PLAY, this.onNotePlay);
    },
    setPattern: function(pattern) {
      _parsePattern(pattern);
      this.render();
      for (var k in this.channelViews) {
        this.channelViews[k].remove();
      }
      for (var k in currentPattern) {
        var $cel = this.$el.find('.channel[data-inst="' + k + '"]');
        this.channelViews[k] = new ChannelView({
          channel: k,
          model: currentPattern[k],
          el: $cel
        });
      }
      this.renderChannels();
    },
    render: function() {
      var data = (currentPattern) ? Object.keys(currentPattern) : [];
      var rawHTML = _template({
        channels: data
      });
      this.$el.html(rawHTML);
      return this;
    },
    renderChannels: function() {
      this.$channelContainer = this.$el.find('.sequencer-channels');
      for (var k in this.channelViews) {
        this.channelViews[k].render();
      }
      this.$steps = $('.channel span');
    },
    setPlayhead: function(stepId) {
      for (var k in this.channelViews) {
        this.channelViews[k].setPlayhead(stepId);
      }
    },
    onNotePlay: function(channel) {
      this.channelViews[channel].spikeEQ();
    },
    stop: function() {
      stop();
      for (var k in this.channelViews) {
        this.channelViews[k].clearPlayhead();
      }
    }
  });
  var _channelTemplate = Handlebars.compile('\
      <div class="seq-row inline">\
      	{{#each notes}}\
        <span data-tic="{{ @index }}" class=""></span>\
				{{/each}}\
      </div>\
	');
  var ChannelView = Backbone.View.extend({
    events: {
      'click .seq-row span': 'onNoteClick',
      'click .pad': 'onPadClick',
      'click .mute': 'onMuteClick'
    },
    channel: null,
    active: true,
    initialize: function(options) {
      this.channel = options.channel;
    },
    render: function() {
      var rawHTML = _channelTemplate({
        id: this.channel,
        symbol: this.channel.substr(0, 1).toUpperCase(),
        notes: this.model
      });
      this.$el.html(rawHTML);
      this.$notes = this.$el.find('.seq-row span');
      this.$eq_bar = this.$el.find('.meter span');
      this.$active = this.$el.find('.mute');
      var self = this;
      this.model.forEach(function(note, idx) {
        var $el = self.$notes.eq(idx);
        if (note === "1") $el.addClass('seq-note');
        if (idx % 4 === 0) $el.addClass('seq-step-measure');
      });
      this.spikeEQ();
      this.$active.toggleClass('active', this.active);
      return this;
    },
    clearPlayhead: function() {
      this.$notes.removeClass('seq-playhead');
    },
    setPlayhead: function(id) {
      this.clearPlayhead();
      this.$notes.filter('[data-tic="' + id + '"]').addClass('seq-playhead');
    },
    onNoteClick: function(e) {
      var tic = $(e.currentTarget).attr('data-tic');
      currentPattern[this.channel][tic] = (currentPattern[this.channel][tic] === "1") ? "0" : "1";
      this.render();
    },
    onMuteClick: function(e) {
      this.active = !this.active;
      channelStatus[this.channel] = this.active;
      this.$active.toggleClass('active', this.active);
    },
    onPadClick: function(e) {
      S.play(this.channel);
      this.spikeEQ(this.channel);
    },
    spikeEQ: function() {
      var self = this;
      this.$eq_bar.removeClass('fade');
      this.$eq_bar.css('transform', 'scaleX(1)');
      setTimeout(function() {
        self.$eq_bar.addClass('fade');
        self.$eq_bar.css('transform', 'scaleX(0)');
      }, 50);
    }
  });

  function init(options) {
    dispatcher.register(evs);
    new SequencerView(options).render();
    setTempo(130);
    _initialized = true;
  }
  return {
    init: init
  }
})(AUDIO, SampleBank);
/**
 * Transport
 **/
var Transport = (function() {
  var evs = {
    TRANSPORT_PLAY: 'transport:play',
    TRANSPORT_STOP: 'transport:stop',
    TRANSPORT_REQUEST_PLAY: 'transport:requestplay',
    TRANSPORT_REQUEST_STOP: 'transport:requeststop',
    TRANSPORT_TEMPO_CHANGED: 'transport:tempochanged',
    TRANSPORT_CHANGE_TEMPO: 'transport:changetempo'
  }
  var _template = Handlebars.compile('\
    <div class="module transport">\
      <button class="transport-play" title="Play">&#9658;</button>\
			<button class="transport-stop" title="Stop">&#9632;</button>\
			<input type="number" size="3" min="30" max="250" value="130" class="transport-tempo" /> \
      <button class="coverart"></button>\
      <button class="tapecollection"></button>\
      <input type="checkbox" id="includecoverart"></div>\
    </div>\
  ');

  function play() {
    console.log('play');
    dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_PLAY);
  }

  function stop() {
    dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_STOP);
  }
  var TransportView = Backbone.View.extend({
    events: {
      'click .transport-play': 'onPlayClick',
      'click .transport-stop': 'onStopClick',
      'change .transport-tempo': 'onTempoChange'
    },
    initialize: function(options) {
      this.listenTo(dispatcher, dispatcher.EventKeys.TRANSPORT_PLAY, play);
      this.listenTo(dispatcher, dispatcher.EventKeys.TRANSPORT_STOP, stop);
      this.listenTo(dispatcher, dispatcher.EventKeys.TRANSPORT_CHANGE_TEMPO, this.onIncomingTempoChange);
    },
    render: function() {
      var rawHTML = _template();
      this.$el.html(rawHTML);
      this.$tempo = this.$el.find('.transport-tempo');
      return this;
    },
    onPlayClick: play,
    onStopClick: stop,
    onTempoChange: function(e) {
      var newTempo = $(e.currentTarget).val();
      dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_TEMPO_CHANGED, newTempo);
    },
    onIncomingTempoChange: function(newTempo) {
      this.$tempo.val(newTempo);
      dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_TEMPO_CHANGED, newTempo);
    }
  });

  function init(options) {
    dispatcher.register(evs);
    new TransportView(options).render();
  }
  return {
    init: init
  }
})();
/**
 * Metronome
 **/
var Metronome = (function() {
  var evs = {
    METRONOME_TIC: 'metronome:tic',
    METRONOME_CLEAR: 'metronome:clear'
  }
  var _template = Handlebars.compile('\
		<h3>Metronome</h3>\
		<div class="control metronome">\
      <span></span>\
      <span></span>\
      <span></span>\
      <span></span>\
    </div>\
	');
  var MetronomeView = Backbone.View.extend({
    initialize: function(options) {
      this.listenTo(dispatcher, dispatcher.EventKeys.METRONOME_TIC, this.onTic);
      this.listenTo(dispatcher, dispatcher.EventKeys.METRONOME_CLEAR, this.clear);
    },
    render: function() {
      var rawHTML = _template();
      this.$el.html(rawHTML);
      this.$steps = this.$el.find('span');
      return this;
    },
    clear: function() {
      this.$steps.removeClass('active');
    },
    onTic: function(stepId) {
      if (stepId % 4 == 0) {
        this.clear();
        this.$steps.eq(Math.floor(stepId / 4)).addClass('active');
      }
    }
  });

  function init(options) {
    dispatcher.register(evs);
    new MetronomeView(options).render();
  }
  return {
    init: init
  }
})();


/**
 * Preset pattern selector
 **/


var PresetList = (function() {
  var evs = {
    PRESET_SELECTED: 'preset:selected'
  }
  propagatepresets()
  console.log(Object.keys(presets).length)
  var _template = Handlebars.compile('\
		<ul class="control presets menu">\
		{{#each items}}\
    	<li style="background:{{ color }}; border:2px solid {{ bordercolor }}; background-image:url({{ image }}); background-size: 52px 13px; "><a style="cursor:pointer" role="button" data-preset-id="{{ @key }}">{{ name }}</a></li>\
    {{/each}}\
    </ul>\
	');
  var PresetListView = Backbone.View.extend({
    events: {
      'click a': 'onPresetClick'
    },
    render: function() {
      var rawHTML = _template({
        items: presets
      });
      this.$el.html(rawHTML);
      this.$items = this.$el.find('a');
      return this;
    },
    onPresetClick: function(e) {
      var id = $(e.currentTarget).attr('data-preset-id');
      this.$items.removeClass('active');
      $(e.currentTarget).addClass('active');
      dispatcher.trigger(dispatcher.EventKeys.PRESET_SELECTED, presets[id]);
    }
  });

  function init(options) {
    dispatcher.register(evs);
    new PresetListView(options).render();
  }
  return {
    init: init
  }
})();
/** Application **/
var App = {
  _connectModules: function() {
    // Transport controls -> sequencer
    dispatcher.on(dispatcher.EventKeys.TRANSPORT_REQUEST_PLAY, function() {
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_PLAY);
    });
    dispatcher.on(dispatcher.EventKeys.TRANSPORT_REQUEST_STOP, function() {
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_STOP);
    });
    dispatcher.on(dispatcher.EventKeys.TRANSPORT_TEMPO_CHANGED, function(newTempo) {
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_TEMPO, newTempo);
    });
    // Sequencer actions -> metronome
    dispatcher.on(dispatcher.EventKeys.SEQUENCER_STEP, function(stepId) {
      dispatcher.trigger(dispatcher.EventKeys.METRONOME_TIC, stepId);
    });
    dispatcher.on(dispatcher.EventKeys.SEQUENCER_STOP, function() {
      dispatcher.trigger(dispatcher.EventKeys.METRONOME_CLEAR);
    });
    // Preset list -> tempo and sequencer
    dispatcher.on(dispatcher.EventKeys.PRESET_SELECTED, function(preset) {
      dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_CHANGE_TEMPO, preset.tempo);
      dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_PATTERN, preset);
    });
  },
  onLoad: function() {
    this._connectModules();
    var pattern = {
      sequence: {
        'openHat': '0000000000000000000000000000000000000000000000000000000000000000',
        'closedHat': '0000000000000000000000000000000000000000000000000000000000000000',
        'snare': '0000000000000000000000000000000000000000000000000000000000000000',
        'kick': '0000000000000000000000000000000000000000000000000000000000000000',
        'clap': '0000000000000000000000000000000000000000000000000000000000000000',
        'stick': '0000000000000000000000000000000000000000000000000000000000000000',
        'conga': '0000000000000000000000000000000000000000000000000000000000000000'
      }
    };
    dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_SET_PATTERN, pattern);
    //dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_PLAY); 
  },
  init: function() {
    // 
    document.addEventListener('visibilitychange', function(e) {
      if (document.hidden) dispatcher.trigger(dispatcher.EventKeys.SEQUENCER_STOP);
    }, false);
    // 808 or GTFO
    var samples = {},
      sampleList = ['kick', 'snare', 'openHat', 'closedHat', "conga", "clap", "stick"];
    sampleList.forEach(function(id) {
      samples[id] = 'https://bog.jollo.org/au/drums/' + id + '.wav';
    });
    Sequencer.init({
      el: $('#r-mid')
    });
    Transport.init({
      el: $('#r-top')
    });
    Metronome.init({
      el: $('#r-head')
    });
    PresetList.init({
      el: $('#r-footer')
    });
    // Load samples and kickoff
    SampleBank.init(samples, this.onLoad.bind(this))
  }
}
App.init();

// events

$(document).on('click', 'button.coverart', function() {
  $('button.coverart').toggleClass('active')
  $('#includecoverart').prop('checked', true)
  $('body').toggleClass("draw babydraw")
})
$(document).on('click', 'button.tapecollection', function() {
  $('button.tapecollection').toggleClass('active')
  $('#r-footer').toggleClass('active')
})

$(document).on('click','.inlinepush',function() { 
  var e = $(this).parent().attr("data-warble")
  handletape("push",e)
  $(this).remove()
})

$(document).on('click','#fullstop',function() {
    $('.inlineplay').removeClass("playing")
    $('#app').removeClass("play")
    dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_STOP);
    swaptracks(true)
})

$(document).on('click','.inlineplay',function() {
  if ($(this).hasClass("playing")) {
    console.log("stopping")
    //stop
    $(this).removeClass('playing')
    $('#app').removeClass("play")
    dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_STOP);
    swaptracks(true)
  }
  else {
    // this item was not playing but it is
    // either playing somewhere else or stopped
    console.log("startingplay")
    $('.inlineplay').removeClass("playing")
    $(this).addClass("playing")
    $('#app').addClass("play")
    swaptracks()
    dispatcher.trigger(dispatcher.EventKeys.TRANSPORT_REQUEST_STOP);
    var e = $(this).parent().attr("data-warble") 
    console.log(e)
    handletape("play",e)
  }
})
