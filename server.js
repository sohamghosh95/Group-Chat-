var PORT = 3000;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection',function (socket) {
   console.log('Socket.io connnected');

   socket.emit('message',{
      name: 'system',
      text:'Welcome',
      timestamp: moment().valueOf()
   });

   socket.on('joingroup',function (request) {
      clientInfo[socket.id] = request;
      socket.join(request.group);
      socket.broadcast.to(request.group).emit('message',{
         name: 'system',
         text:request.name + ' joined group ' + request.group,
         timestamp: moment().valueOf()
      });

   });

   socket.on('disconnect',function () {
      if(typeof clientInfo[socket.id] !== 'undefined'){
         socket.leave(clientInfo[socket.id]);
         io.to(clientInfo[socket.id].group).emit('message',{
            name: 'system',
            text: clientInfo[socket.id].name + ' left group ' + clientInfo[socket.id].group,
            timestamp: moment().valueOf()
         });
         //delete user data of left user
         delete clientInfo[socket.id];
      }
   });



   //if a user sends a message then the server recieves it and then sends it to other users
   socket.on('message',function (message) {
      console.log('Message recieved : '+message.text);
      //broadcst to all other users
      // socket.broadcast.emit('message',message);

      message.timestamp = moment().valueOf();

      //broadcast to all users in a group
      io.to(clientInfo[socket.id].group).emit('message',message);

      //broadcast to all users
      // io.emit('message',message);


   });

});

http.listen(PORT,function () {
   console.log('Server Port : ' + PORT);
});
