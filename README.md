# bogchat

![screenshot](http://i.imgur.com/SgTloAi.png)
---
    $ npm install websocket node-localstorage mysql dotenv crypto-js
    $ apt-get install mysql-server
    
need a `.env` file like this:

    sql=password
    sha=password
    opermessage=message
    aes=password

need a db `bogchat` with a table `bogchat` like this:

    mysql> create table bogchat (
      id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      postid INT,
      username VARCHAR(100),
      context TEXT(30000),
      favd INT
    );
    
then
 
    $ nodejs server.js
    
use nginx to host the files.. proxy pass listening on 1337.. needs SSL
