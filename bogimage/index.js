//
var port = 8000
var imgport = 8001
var url = "img.bog.jollo.org"
var nginx = false

//
var formidable = require("formidable")
var http = require("http")
var util = require("util")
var fs = require("fs")
var express = require('express');
var server = express();


if (!fs.existsSync("./img")){
  fs.mkdirSync("./img")
}

http.createServer(function(req, res) {
  if(req.url == "/upload" && req.method.toLowerCase() == "post") {
    var form = new formidable.IncomingForm();
    form.on('progress', function(bytesReceived, bytesExpected) {
            if (bytesReceived > 3 * 1024 * 1024) {
              if (!res.ended){
                  form.pause();
                  res.end("429")
                  res.ended = true;
              }
            }
    });
    form.parse(req, function(err, fields, files) {
      time = new Date();
      name = files.upload.name.split(".");
      extension = name[name.length-1];
      var year = time.getFullYear()
      var month = (time.getMonth()+1)
      var date = time.getDate()
      var hours = time.getHours()
      var minutes = time.getMinutes()
      var seconds = time.getSeconds()

      if (!fs.existsSync("./img/"+year)){
        fs.mkdirSync("./img/"+year)
      }
      if (!fs.existsSync("./img/"+year+"/"+month)){
        fs.mkdirSync("./img/"+year+"/"+month)
      }
      if (!fs.existsSync("./img/"+year+"/"+month+"/"+date)){
        fs.mkdirSync("./img/"+year+"/"+month+"/"+date)
      }
      var imageurl
      imageurl = year+"-"+month+"-"+date+"_"+hours+"-"+minutes+"-"+seconds+"."+extension
      fs.renameSync(files.upload.path, "./img/"+year+"/"+month+"/"+date+"/"+imageurl)
      
      res.writeHead(200, {"Content-Type": "text/plain"})
      if (nginx) {
        var domain = "http://"+url
      } else {
        var domain = "http://"+url+":"+imgport 
      }
      res.end(domain+"/"+year+"/"+month+"/"+date+"/"+imageurl)
    });
    return;
  }
  
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(port)

server.use('/', express.static(__dirname + '/img'));
server.listen(imgport);