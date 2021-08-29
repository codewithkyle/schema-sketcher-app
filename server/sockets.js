const { v4: uuid } = require('uuid');
const path = require("path");
const fs = require("fs");
const CryptoJS = require("crypto-js");

const collabDir = path.join(__dirname, "sessions");

class Socket {
    constructor(socket){
        this.socket = socket;
        this.isCollab = false;
        this.isOwner = false;
        this.room = null;
        this.name = "";

        // TODO: map name to account using token OR assign anon name

        this.socket.on("create-room", this.createRoom.bind(this));
        this.socket.on("disconnect", this.disconnect.bind(this));
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

    async createRoom(data){
        const { password, allowAnon } = data;
        let room = uuid();
        if (password.trim().length){
            room = await this.encrypt(room, password.trim());
            console.log(room);
        }
        await fs.promises.writeFile(path.join(collabDir, room), "");
        this.socket.join(room);
        this.isCollab = true;
        this.isOwner = true;
        this.room = room;
    }

    encrypt(messageToencrypt, secretkey){
        const encryptedMessage = CryptoJS.AES.encrypt(messageToencrypt, secretkey);
        return encryptedMessage.toString();
    }

    decrypt(encryptedMessage, secretkey){
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretkey);
        const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return decryptedMessage;
    }
}
module.exports = Socket;