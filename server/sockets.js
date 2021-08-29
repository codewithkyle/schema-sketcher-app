const sockets = [];

function addSocket(socket){
    sockets.push(socket);
    console.log(`Socket ${socket.id} connected`);
    socket.on("disconnect", ()=>{
        handleDisconnect(socket.id);
    });
}

function handleDisconnect(id){
    for (let i = sockets.length - 1; i >= 0; i--){
        if (sockets[i].id === id){
            sockets.splice(i, 1);
            console.log(`Socket ${id} disconnected`);
            break;
        }
    }
}

module.exports = { addSocket };