let io;

module.exports = {
    init: httpServer => {
      io = require('socket.io')(httpServer, {
        cors: {                                          //The newer version of socket.io requires us to enable CORS explicitly
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
      return io;
    },
    getIO: () => {    //we can use init() instead of getIO() for getting io object, but it will intialize every time we call it, 
        if(!io){                                                                                   //so we want it to initialize once only
            throw new Error('Socket.io not found..!!!')
        }
        return io;
    }
}