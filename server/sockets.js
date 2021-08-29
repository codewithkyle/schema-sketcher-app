const { v4: uuid } = require('uuid');
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const collabDir = path.join(__dirname, "sessions");

class Socket {
    constructor(socket){
        this.socket = socket;
        this.isCollab = false;
        this.isOwner = false;
        this.room = null;
        this.name = "";

        // TODO: map name to account using token OR assign anon name

        this.socket.on("create-room", this.createRoom);
        this.socket.on("disconnect", this.disconnect);
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
            room = await this.encryptText(room);
            console.log(room);
        }
        await fs.promises.writeFile(path.join(collabDir, room));
        this.socket.join(room);
        this.isCollab = true;
        this.isOwner = true;
        this.room = room;
    }

    async encryptText(text){
        const key = await crypto.subtle.generateKey({name: 'AES-GCM', length: 128}, true, ['encrypt', 'decrypt']);
        const iv = await crypto.getRandomValues(new Uint8Array(16));
        return await crypto.subtle.encrypt({name: 'AES-GCM', tagLength: 32, iv}, key, new TextEncoder().encode(text));
    }
}
module.exports = Socket;