"use strict";

process.title = 'node-chat-staging';

var mysql = require('mysql');
var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'admin',
  password : 'eJ7dICpftHfnXDXZ3Rkw',
  database : 'bogchat'
});

var webSocketsServerPort = 1337;

var webSocketServer = require('websocket').server;
var http = require('http');
var localStorage

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var history = [ ]

if (localStorage.getItem('history') ) {
  history = JSON.parse(localStorage.getItem('history'))
}

var clients = [ ]

var increment = 0;

if (localStorage.getItem('increment') ) {
  increment = JSON.parse(localStorage.getItem('increment'))
}

// util

function mysql_real_escape_string(str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\"+char;
    }
  });
}

function richtext(input) {
  var matches = []
  function checkimgurl(url) {
    return(url.match(/^https?\:\/\/.+\/.+\.(jpeg|jpg|gif|png|bmp|JPEG|JPG|GIF|PNG|BMP)$/) != null)
  }
  var string = input.split(" ")
  for (var i=0;i<string.length;i++) {
    var word = string[i]
    if (checkimgurl(word)) {
      matches.push(word)
    }
  }
  return matches
}

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').substring(0,30000)
}

//

var server = http.createServer(function(request, response) {

})

server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  var colors = [ 'red', 'blue', 'magenta', 'purple', 'coral', 'orangered' ];
  colors.sort(function(a,b) { return Math.random() > 0.5; } );

  var connection = request.accept(null, request.origin); 
  
  var json = JSON.stringify({ type:'hi' });
  for (var i=0; i < clients.length; i++) {
    clients[i].sendUTF(json);
  }
  
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;

  console.log((new Date()) + ' Connection accepted.');

  if (history.length > 0) {
    connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
  }

  connection.on('message', function(message) {
    if (message.type === 'utf8') { 
      if (userName === false) { 
        if ( isJSON(message.utf8Data)) {
          var parsed = JSON.parse(message.utf8Data)
            if (parsed.type == "nick" ) {
              userName = htmlEntities(parsed.data)
              userName = userName.substring(0,100)
              userColor = colors[0];
              connection.sendUTF(JSON.stringify({ type:'color', data: userColor }))
              console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.')
            }
          }
        }
        else {
          if (isJSON(message.utf8Data) ){
          var parsed = JSON.parse(message.utf8Data)
          
          if (parsed.type == "message" ) {
            console.log("message " + parsed.data)

            increment++

            var thistime = (new Date()).getTime()
            var thismessage = htmlEntities(parsed.data)
            var obj = {
              time: thistime,
              text: thismessage,
              author: userName,
              color: userColor,
              id: increment
            }
            
            history.push(obj);
            history = history.slice(-100);
            localStorage.setItem('history', JSON.stringify(history))
            localStorage.setItem('increment', increment)

            var ctime = parseInt((+ new Date()).toString().slice(0,-3))
            var matches = richtext(thismessage).slice(0,10)
            
            // mySQL

            for (i=0;i<matches.length;i++) {
              pool.query('INSERT INTO bogchat (postid, username, context, ctime) VALUES ('+increment+', "'+mysql_real_escape_string(userName.toString().substring(0,100))+'", "'+mysql_real_escape_string(matches[i])+'", '+ctime+')', function (error, results, fields) {
                if (error) throw error;
              });
            }            
            
            var json = JSON.stringify({ type:'message', data: obj })
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }
            
          }
          else if (parsed.type == "fav" ) {
            if ( !isNaN(parsed.data) ) {
              if (parsed.data <= increment && parsed.data > 0 ) {

                pool.query('UPDATE bogchat SET favd = (CASE WHEN favd IS NULL THEN 0 ELSE favd END) + 1 WHERE postid = '+mysql_real_escape_string(parsed.data)+';', function (error, results, fields) {
                  if (error) throw error;
                });
 
                 for (var i=0; i < clients.length; i++) {
                   clients[i].sendUTF(JSON.stringify({type:'fav', data: parsed.data}))
                }             
              }
            }
          }
          else if (parsed.type == "ping" ) {
            connection.sendUTF(JSON.stringify({ type:'pong', data: parsed.data }))
          }
        }
      }
    } 
    else {
      // do something with favs, treehouse, other stuff.. these can be objects i guess
    }
  });

  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer "
      + connection.remoteAddress + " disconnected.");
      for (var i = 0; i < clients.length; i ++) {
        if (connection.remoteAddress == clients[i].remoteAddress) { 
          clients.splice(i, 1)
        }
      }
      colors.push(userColor);
      var json = JSON.stringify({ type:'byebye' })
      for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(json)
      }
    }
  })
})