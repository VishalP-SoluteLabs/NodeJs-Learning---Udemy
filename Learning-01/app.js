require('dotenv').config(); //to load environment file

const http = require('http');

const routes = require('./routes')


console.log(routes.someText)

const server = http.createServer(routes.handler)


server.listen(process.env.PORT || 3000, () => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

  console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
});
