var formidable = require("formidable"),
    http       = require("http"),
    util       = require("util"),
    fs         = require("fs");

http.createServer(function(req, res) {
    if(req.url == "/upload" && req.method.toLowerCase() == "post") {
        var form = new formidable.IncomingForm();
        
        form.parse(req, function(err, fields, files) {
        
            time = new Date();
           
            name = files.upload.name.split(".");
            extension = name[name.length-1];
            image_url = time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate()+"_"+time.getHours()+"-"+time.getMinutes()+"-"+time.getSeconds()+"."+extension;
            fs.renameSync(files.upload.path, "/var/www/bog/bogchat/img/"+image_url);
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end("https://bog.jollo.org/img/"+image_url);
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
}).listen(8000);
