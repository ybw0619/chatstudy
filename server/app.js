
const express = require('express');

const app = express();

app.use(express.static(__dirname + '/public'));

var userInfo = {}

const server = app.listen(80, function() {
    console.log('server running on port 80');
});



const io = require('socket.io')(server,{
  pingTimeout: 15000,
  pingInterval:	10000
});

io.on('connection', function(socket) {
var addedUser = false;
    var userName ='';
    var data = {};
    data.info = socket.id+" 연결-------------------";
    console.log(data.info);

    socket.on('JOIN_MESSAGE', function(userName) {
	if (addedUser) return;

        this.userName = userName;
        data.info = this.userName+"님이 입장하셨습니다.";
	console.log(data.info);
	addedUser = true;
        io.emit('MESSAGE', data)
    });

    socket.on('disconnect', function (a) {
      if(this.userName){
         data.info = this.userName+"님이 퇴장하셨습니다.";
         io.emit('INFO', data)
      }
      
    });

    socket.on('SEND_MESSAGE', function(data) {
        console.log(this.userName + "님이 메세지를 보냄");
        io.emit('MESSAGE', data)
    });

    socket.on('reconnection', function(data) {
        data.info = userInfo[socket.id]+"님이 재입장하셨습니다.";
        io.emit('MESSAGE', data)
    });


});
