const fs = require('fs');

const requestHandler = (req, res) =>{
    const url = req.url;
    const method = req.method;
    if (url === '/') {
            res.write('<html>')
            res.write('<head><title>Testing</title></head>')
            res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>')
            res.write('</html>')
        res.end()
    }

    if (url === '/message' && method === 'POST') {

        const body = [];
        req.on('data', (chunk) => {                   //'.on' is a method in Node.js used to handle incoming data for an HTTP request.
            console.log(chunk)
            body.push(chunk)
        });

        req.on('end', () => {                                  //the 'end' event is used to log the received data and send a response back to the client.        
            const parsedBody = Buffer.concat(body).toString(); 
            const message = parsedBody.split('=')[1];

            fs.writeFile('message.txt', message, err => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end('Data received');
            });

        });

 

    }
}

module.exports = {
    handler: requestHandler,
    someText: 'Hello Duniya'
} ;