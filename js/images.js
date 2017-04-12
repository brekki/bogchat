function coverarttoimgur(uri) {
  var clientId = "a91768c3de50774";               
  $.ajax({
      url: "https://api.imgur.com/3/upload",
      type: "POST",
      datatype: "json",
      data: {
      'image': uri,
      'type': 'base64'
    },
    success: uploadtrackfull,
    error: function(){console.log("failed")},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
    }
  })
}

function webcamtoimgur(uri) {
  var clientId = "a91768c3de50774";               
  $.ajax({
      url: "https://api.imgur.com/3/upload",
      type: "POST",
      datatype: "json",
      data: {
      'image': uri,
      'type': 'base64'
    },
    success: fdone,
    error: function(){console.log("failed")},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
    }
  })
}

function imagefiletoimgur(uri) {
  var clientId = "a91768c3de50774";               
  $.ajax({
      url: "https://api.imgur.com/3/upload",
      type: "POST",
      datatype: "json",
      data: {
      'image': uri,
      'type': 'base64'
    },
    success: feedback,//calling function which displays url
    error: function(){console.log("failed")},
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
    }
  })
}

var feedback = function (res) {
  if (res.success === true) {
     if (locked) {
      var x = res.data.link
      var oldval = $('#msg #input').val()
      var oldval = `${oldval} ${x} `
      $('#input').val(oldval)       
     }
     else {
       connection.send(JSON.stringify({type: "message", data: res.data.link}))
     }
  }
}

function fdone(data) {
  connection.send(JSON.stringify({type: "message", data: data.data.link}))
}