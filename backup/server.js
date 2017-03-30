// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat-staging';

// Port where we'll run the websocket server
//var webSocketsServerPort = 1337;
var webSocketsServerPort = 1337;
// prod
//var webSocketsServerPort = 1337;

// websocket and http servers
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





// latest 100 messages

// list of currently connected clients (users)
var clients = [ ]

var increment = 0;

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

// Array with some colors



var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});


var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket request is just
  // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server

wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  var colors = [ 'red', 'blue', 'magenta', 'purple', 'coral', 'orangered' ];
  // ... in random order
  colors.sort(function(a,b) { return Math.random() > 0.5; } );

  // accept connection - you should check 'request.origin' to make sure that
  // client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  var connection = request.accept(null, request.origin); 
  
  var json = JSON.stringify({ type:'hi' });
  for (var i=0; i < clients.length; i++) {
    clients[i].sendUTF(json);
  }
  
  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;

  console.log((new Date()) + ' Connection accepted.');

  // send back chat history
  if (history.length > 0) {
    connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
  }

  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
      if (userName === false) { // first message sent by user is their name
        // remember user name
        if ( isJSON(message.utf8Data)) {
        var parsed = JSON.parse(message.utf8Data)
          if (parsed.type == "nick" ) {
            userName = htmlEntities(parsed.data)
            userName = userName.substring(0,100)
            // get random color and send it back to the user
            userColor = colors[0];
            connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
            console.log((new Date()) + ' User is known as: ' + userName
                  + ' with ' + userColor + ' color.');
        }
      }
      } else {
        if (isJSON(message.utf8Data) ){
        var parsed = JSON.parse(message.utf8Data)
        console.log("messagereceived")
        
        if (parsed.type == "message" ) {
          console.log("message " + parsed.data)

        increment++
        // log and broadcast the message
          console.log((new Date()) + ' Received Message from '
                + userName + ': ' + parsed.data);
          
          // we want to keep history of all sent messages
          var thistime = (new Date()).getTime()
          var thismessage = htmlEntities(parsed.data)
          var obj = {
            time: thistime,
            text: thismessage,
            author: userName,
            color: userColor,
            id: increment
          };
          history.push(obj);
          history = history.slice(-100);
          localStorage.setItem('history', JSON.stringify(history))


          // broadcast message to all connected clients
          var json = JSON.stringify({ type:'message', data: obj })
          for (var i=0; i < clients.length; i++) {
            clients[i].sendUTF(json);
          }
        }
        else if (parsed.type == "fav" ) {
          if ( !isNaN(parsed.data) ) {
            if (parsed.data <= increment && parsed.data > 0 ) {
               for (var i=0; i < clients.length; i++) {
                 clients[i].sendUTF(JSON.stringify({type:'fav', data: parsed.data}));
              }             
            }
          }

        }
      }
      }
    } else {
      // do something with favs, treehouse, other stuff.. these can be objects i guess
    }
  });

  // user disconnected
    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // loop to the clients and compare remote address to be removed
           for (var i = 0; i < clients.length; i ++) {
                if (connection.remoteAddress == clients[i].remoteAddress) { //compare remote address to remove from the disconnecting client
                     clients.splice(i, 1);
                }
           }
            // push back user's color to be reused by another user
            colors.push(userColor);
            var json = JSON.stringify({ type:'byebye' });
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json);
            }
        }
    })

});
