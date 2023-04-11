require('dotenv').config(); //to load environment file
const path = require('path');


const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // to store filename with date format conviniently

const feedRoutes = require('./routes/feed.js');
const authRoutes = require('./routes/auth.js');

const app = express();
  
const fileStorage = multer.diskStorage({       
  destination: function(req, file, cb) {
      cb(null, 'images');
  },
  filename: function(req, file, cb) {
   
      cb(null, uuidv4() + '-' + file.originalname)
  }
});


const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json           //to parse json data from incoming requests
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')))


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');            // It will not send  response, but only set the Header
    res.setHeader('Access-Control-Allow-Methods', ' GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });

})


mongoose.connect('mongodb+srv://admin-vishal:OiXu0VqZrnApu31L@cluster0.tqqbw.mongodb.net/rest-api-practical-app?w=majority')
.then(result => {
  const server = app.listen(process.env.PORT || 3000, (err) => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)
      if (!err) {
        console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
      } else console.log(err)
    })
    const io = require('./socket.js').init(server );

    io.on('connection', socket => {
      console.log('Client Connected Successfully..!');
    })
})
.catch(err => console.log(err))