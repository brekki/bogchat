"use strict";
require('dotenv').config()
process.title = 'node-chat-staging';

var mysql = require('mysql');
var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'admin',
  password : process.env.sql,
  database : 'bogchat'
});

var webSocketsServerPort = 1337;

var webSocketServer = require('websocket').server;
var http = require('http');
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");

function hashstringify(wordArray) {
  var words = wordArray.words
  var sigBytes = wordArray.sigBytes
  var hexChars = []
  for (var i = 0; i < sigBytes; i++) {
    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    hexChars.push((bite >>> 4).toString(16))
    hexChars.push((bite & 0x0f).toString(16))
  }
  return hexChars.join('')
}
  
function uniquepush(item, oldarray) {

  if (oldarray.indexOf(item) === -1) {
    oldarray.push(item)
  }

  return oldarray
}

//if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  var localStorage = new LocalStorage('./scratch');
//}

var history = [ ]

var bannedips = [ ]

if (localStorage.getItem('xbannedips') ) {
  bannedips = JSON.parse(localStorage.getItem('xbannedips'))
  console.log(JSON.stringify(bannedips))
}

if (localStorage.getItem('history') ) {
  history = JSON.parse(localStorage.getItem('history'))
}

var clients = [ ]

var increment = 0;

if (localStorage.getItem('increment') ) {
  increment = JSON.parse(localStorage.getItem('increment'))
}

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
  
  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
  
  
  var colors = [ 'red', 'blue', 'magenta', 'purple', 'coral', 'orangered' ];
  colors = shuffle(colors)

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
  else {
    console.log("why isnt there any history")
  }

  connection.on('message', function(message) {
    
    if (bannedips.indexOf(connection.remoteAddress) > -1) {
      return
    }
    //console.log(JSON.stringify(message))
    if (message.type === 'utf8') { 
    
      if (userName === false) {
        if ( isJSON(message.utf8Data)) {
          var parsed = JSON.parse(message.utf8Data)
            if (parsed.type == "nick" ) {
              userName = htmlEntities(parsed.data)
              userName = userName.substring(0,100)
              userColor = colors[0];
              
              
              if (userName == "yvonne") {
                userColor = "magenta"
              }
              connection.sendUTF(JSON.stringify({ type:'color', data: userColor }))

            }
          }
          else {
            console.log("no")
          }
        } 
        else {
          if ( isJSON(message.utf8Data) ) {
          var parsed = JSON.parse(message.utf8Data)
          
          if ( parsed.type == "message" ) {
            //console.log("message " + parsed.data)

            increment++

            var thistime = (new Date()).getTime()
            var thismessage = htmlEntities(parsed.data)
            var thislocale = CryptoJS.AES.encrypt(connection.remoteAddress, process.env.aes).toString()
            var obj = {
              time: thistime,
              text: thismessage,
              author: userName,
              color: userColor,
              locale: thislocale,
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
          else if (parsed.type == "drum" ) {
            //console.log("drum")
            increment++
            var thistime = (new Date()).getTime()
            var thismessage = htmlEntities(parsed.data)
            var thislocale = CryptoJS.AES.encrypt(connection.remoteAddress, process.env.aes).toString()
            var obj = {
              time: thistime,
              text: thismessage,
              drum: true,
              author: userName,
              locale: thislocale,
              color: userColor,
              id: increment
            }
            
            history.push(obj);
            history = history.slice(-100);
            localStorage.setItem('history', JSON.stringify(history))
            localStorage.setItem('increment', increment)
          
            var ctime = parseInt((+ new Date()).toString().slice(0,-3))
            var matches = richtext(thismessage).slice(0,10)
                
            var json = JSON.stringify({ type:'drum', data: obj })
            for (var i=0; i < clients.length; i++) {
              clients[i].sendUTF(json)
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
          else if (parsed.type == "whatshot" ) {
            var yctime = (parseInt((+ new Date()).toString().slice(0,-3)) - 86400)
            pool.query('select * from bogchat where ctime > '+yctime+' and favd > 4', function (error, results, fields) {
              if (error) throw error;
              connection.sendUTF(JSON.stringify({ type:'whatshot', data: results }))
            });
          }
          
          //
          
          else if ( parsed.type == "oper") {
            
            //console.log(JSON.stringify(parsed.data))
            
            if (parsed.data.login) {
              if ( hashstringify(SHA256(parsed.data.login)) == process.env.sha ) {
                connection.sendUTF(JSON.stringify(
                  { 
                    type:'oper',
                    data: {
                      type:"login",
                      message:process.env.opermessage,
                      content:parsed.data.login
                    }
                  }
                ))
              }
            }
            else {
              if (parsed.data.id) {
                
                // verify id is correct
                if ( hashstringify(SHA256(parsed.data.id)) == process.env.sha ) {
                  if (parsed.data.command) {
                  
                    //console.log("good process " + parsed.data.command)
                    var n = parsed.data.command.split(" ");
                    
                    if (n[0] == "ban") {
                      n.splice(0,1)
                      n = n.join(" ")
                      //console.log("lookup " + n)
                      uniquepush(n,bannedips)
                      localStorage.setItem("xbannedips",JSON.stringify(bannedips))
                    }
                    else if (n[0] == "dec") {
                      //console.log(n[1])
                      //console.log(n[2])
                      var bytes  = CryptoJS.AES.decrypt(n[2], process.env.aes)
                      var plaintext = bytes.toString(CryptoJS.enc.Utf8)
                      connection.sendUTF(JSON.stringify( {
                          type: 'decreq', 
                          data: {
                            id: n[1],
                            req: plaintext
                          }
                        } 
                      ));                      
                    }
                  }
                }
              }
            }
          }
        }
      }
    } 
    else {
      // do something with favs, treehouse, other stuff.. these can be objects i guess
    }
  });

  connection.on('close', function(e) {

    for (var i = 0; i < clients.length; i ++) {
    if ((connection.remoteAddress == clients[i].remoteAddress) && (connection.socket._peername.port == clients[i].socket._peername.port)) {
        //console.log("spliced")
        clients.splice(i, 1)
      };
    };
    //colors.push(userColor);
    var json = JSON.stringify({ type:'byebye' })
    for (var i=0; i < clients.length; i++) {
      clients[i].sendUTF(json)
    }
  })
})