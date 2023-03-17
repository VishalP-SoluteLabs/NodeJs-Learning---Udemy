require('dotenv').config(); //to load environment file

const http = require('http');
const express = require('express')

const app = express();

app.use((req,res,next)=>{
   console.log('First')
   next();                           // This invokes next middleware on line: 13
})

app.use((req,res,next)=>{
    console.log('Next')
    res.sendFile('index.html', {root: __dirname })
 })
 

const server = http.createServer(app)


server.listen(process.env.PORT || 3000, () => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

  console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
});