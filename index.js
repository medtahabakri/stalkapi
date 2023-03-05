const express = require('express')
const app = express()
const server = require('http').createServer(app);
const dotenv = require('dotenv').config({path:__dirname+'/.env'})
const cors = require('cors')
const WebSocket = require('ws');
const router = require('express').Router();

const wss = new WebSocket.Server({server:server});

let ws_connections = [];

wss.on('connection', function connection(ws,req) {
  ws._id = req.url.split('id=')[1];
  ws_connections.push(ws);
  ws.send(JSON.stringify({
    msg:'Welcome'
  }));

  ws.on('message', (res , isBinary)=>{
    console.log(ws._id)  
    if(res){
      try {
        if(isBinary){
          const data = res;
          const message = {
            coords: data,
            date: (new Date()).toUTCString()
          };
          ws_connections.forEach(function(client) {
            if(client._id != ws._id)
            client.send(JSON.stringify(message));
          });
        }else{
          const data = JSON.parse(res.toString());
          const message = {
            id: ws._id,
            coords: data,
            date: (new Date()).toUTCString()
          };
          console.log(message);
          ws_connections.forEach(function(client) {
            // if(client._id != ws._id)
            client.send(JSON.stringify(message));
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  ws.on('close',()=>{
    ws_connections.map((val,idx)=>{
      if(val._id == ws._id )
      ws_connections.splice(idx,1)
    })
  })

});


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))

router.get('/testServer', ( req , res )=>{
    return res.send('server response');
})
app.use('/',router);

server.listen(3300,()=>{
  console.log('servers started')
});