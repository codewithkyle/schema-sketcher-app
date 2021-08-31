const { v4: uuid } = require('uuid');
const path = require("path");
const fs = require("fs");
const CryptoJS = require("crypto-js");

const animals = require("./animals");
const collabDir = path.join(__dirname, "sessions");

class Socket {
    constructor(socket){
        this.socket = socket;
        this.isCollab = false;
        this.isOwner = false;
        this.room = null;
        this.diagramID = null;
        this.name = this.generateName();

        // TODO: map name to account using token

        this.socket.on("create-room", this.createRoom.bind(this));
        this.socket.on("disconnect", this.disconnect.bind(this));
        this.socket.on("join-room", this.joinRoom.bind(this));
        this.socket.on("op", this.broadcastOP.bind(this));
        this.socket.on("log-op", this.logOP.bind(this));
    }

    async logOP(op){
        if (this.room &&  this.isCollab){
            await fs.promises.writeFile(path.join(collabDir, this.room), `${JSON.stringify(op)}\n`, {flag: "a"});
        }
    }

    async broadcastOP(op){
        if (this.room &&  this.isCollab){
            await fs.promises.writeFile(path.join(collabDir, this.room), `${JSON.stringify(op)}\n`, {flag: "a"});
            this.socket.to(this.room).emit("op", op);
        }
    }

    async disconnect(){
        if (this.isCollab && this.isOwner && this.room){
            this.socket.to(this.room).emit("close-room");
            await fs.promises.rm(path.join(collabDir, this.room));
        }
        else if (this.isCollab && this.room){
            this.socket.to(this.room).emit("user-disconnect", {
                name: this.name,
            });
        }
    }

    random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

    generateName(){
        return `Anonymouse ${animals[this.random(0, animals.length)]}`;
    }

    async createRoom(data){
        const { password, allowAnon, diagramID } = data;
        const roomID = uuid();
        let room = roomID;
        if (password.trim().length){
            room = await this.encrypt(room, password.trim());
        }
        console.log(roomID);
        await fs.promises.writeFile(path.join(collabDir, room), "");
        this.socket.join(room);
        this.isCollab = true;
        this.isOwner = true;
        this.room = room;
        this.diagramID = diagramID;
        this.socket.emit("room-created", {
            room: room,
            diagram: diagramID,
            requirePassword: password.trim().length > 0,
        });
    }

    async joinRoom(data){
        let { room, password, diagramID } = data;
        if (password.trim().length){
            room = await this.decrypt(room, password.trim());
        }
        console.log(room);
        if (fs.existsSync(path.join(collabDir, room))){
            console.log("joined");
            this.socket.join(room);
            this.room = room;
            this.diagramID = diagramID;
            this.isCollab = true;
            this.socket.to(room).emit("user-connected", {
                name: this.name,
            });
            this.socket.emit("room-joined", {
                room: this.room,
                diagram: diagramID,
            });
        }
        else {
            this.socket.emit("room-error", {
                error: "Incorrect password or session ID.",
            });
        }
    }

    encrypt(messageToencrypt, secretkey){
        const encryptedMessage = CryptoJS.AES.encrypt(messageToencrypt, secretkey);
        return encodeURIComponent(encryptedMessage.toString());
    }

    decrypt(encryptedMessage, secretkey){
        const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedMessage), secretkey);
        const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedMessage;
    }
}
module.exports = Socket;
