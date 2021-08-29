let socketCount = 0;
function addSocket(socket){
    if (socketCount === 0){
        socket.join("test");
    }
    socketCount++;
    setTimeout(() => {
        socket.to("test").emit("message", "hello world");
    }, 5000);
}

module.exports = { addSocket };