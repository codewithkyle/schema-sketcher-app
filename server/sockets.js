function addSocket(socket){
    sockets.push(socket);
    socket.join("test");

    setTimeout(() => {
        socket.to("test").emit("message", "hello world");
    }, 5000);
}

module.exports = { addSocket };