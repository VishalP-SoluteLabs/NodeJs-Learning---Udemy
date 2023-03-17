const express = require('express');

const app = express();

app.use('/favicon.ico', (req, res) => res.status(204));

app.use('/users',(req,res,next)=>{
    
    res.send('<h1>Users</h1>')
})

app.use('/',(req,res,next)=>{
    res.end('<h1>Home</h1>')
})


app.listen(3000)
