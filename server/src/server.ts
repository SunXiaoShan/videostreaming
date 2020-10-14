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
 }

 private configureApp(): void {
  this.app.use(express.static(path.join(__dirname, "../public")));
}

 private handleSocketConnection(): void {
   this.io.on("connection", socket => {
     console.log("Socket connected.");
   });
 }
 
 public listen(callback: (port: number) => void): void {
   this.httpServer.listen(this.DEFAULT_PORT, () =>
     callback(this.DEFAULT_PORT)
   );
 }
}