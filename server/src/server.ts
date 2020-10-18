import { Application } from "express";
import express = require('express')
import { Server as SocketIOServer } from "socket.io";
import socketIO = require('socket.io')
import { createServer, Server as HTTPServer } from "http";
import path = require('path');
 
export class Server {
 private httpServer: HTTPServer;
 private app: Application;
 private io: SocketIOServer;
 
 private readonly DEFAULT_PORT = 5000;

 private activeSockets: string[] = [];
 
 constructor() {
   this.initialize();
 }
 
 private initialize(): void {
   this.app = express();
   this.httpServer = createServer(this.app);
   this.io = socketIO(this.httpServer);

   this.configureApp();
   this.handleRoutes();
   this.handleSocketConnection();
 }
 
 private handleRoutes(): void {
   this.app.get("/helloworld", (req, res) => {
     res.send(`Hello World :` + __dirname); 
   });

   this.app.get("/video", (req, res) => {
    res.sendFile('index.html', { root: './public/' })
    });

    this.app.get("/hello", (req, res) => {
      res.sendFile('hello.html', { root: './public/' })
    });

    this.app.get("/send_show_hello_world_cmd", (req, res) => {
      for (var i = 0; i < this.activeSockets.length; i++) {
        var socketId = this.activeSockets[i];
        let connecetedList = this.io.sockets.connected
        let socket = connecetedList[socketId]


        socket.emit(
          'show_hello_world',
          { 'socketId': socketId }
        )
      }

      res.send("999");
    });
 }

 private configureApp(): void {
  this.app.use(express.static(path.join(__dirname, "../public")));
}

 private handleSocketConnection(): void {
   this.io.on("connection", socket => {
     console.log("Socket connected. " + socket.id);

     const existingSocket = this.activeSockets.find(
      existingSocket => existingSocket === socket.id
     );

    if (!existingSocket) {
      this.activeSockets.push(socket.id);

      socket.emit(
        "update-user-list", 
        {
            users: this.activeSockets.filter(
              existingSocket => existingSocket !== socket.id
            )
        });

      socket.broadcast.emit("update-user-list", {
        users: [socket.id]
      });
    }

    socket.on("call-user", (data: any) => {
      console.log("receive event: " + data)

      socket.to(data.to).emit(
        "call-made", 
        {
        offer: data.offer,
        socket: socket.id
        });
    });

    socket.on("make-answer", data => {
      // console.log("make-answer: " + JSON.stringify(data))
      socket.to(data.to).emit("answer-made", {
        socket: socket.id,
        answer: data.answer
      });
    });

    socket.on("reject-call", data => {
      socket.to(data.from).emit(
        "call-rejected", 
        {
          socket: socket.id
        });
    });

    socket.on("disconnect", () => {
      this.activeSockets = this.activeSockets.filter(
        existingSocket => existingSocket !== socket.id
      );
      socket.broadcast.emit("remove-user", {
        socketId: socket.id
      });
    });

   });
 }
 
 public listen(callback: (port: number) => void): void {
   this.httpServer.listen(this.DEFAULT_PORT, () =>
     callback(this.DEFAULT_PORT)
   );
 }
}