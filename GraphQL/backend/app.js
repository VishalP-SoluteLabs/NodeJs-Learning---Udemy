require('dotenv').config(); //to load environment file
const path = require('path');
const { clearImage } = require('./util/file.js');


const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // to store filename with date format conviniently

const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema.js');
const graphqlResolver = require('./graphql/resolvers.js');
const auth = require('./middleware/auth.js');

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
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
      return res.sendStatus(200)
    }
    next();
})

app.use(auth);

app.put('/post-image', (req, res, next) => {
  if(!req.isAuth){
    throw new Error('Not authenticated..!')
  }
     if(!req.file){
      return res.status(200).json({ message: 'No file provided..! '});
     }
     if(req.body.oldPath){
          clearImage(req.body.oldPath)
     }
     console.log(req.file.path)
     return res.status(201).json({ message: 'File Stored successfully..!', filePath: req.file.path}) //req.file.path is the path where multer stores image
})


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
})

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,    //helps to use GraphiQL interface in the browser on the server       and         //helps to use /graphql for get & post both
  customFormatErrorFn(err){ 
    console.log('BBBBBBBBBBB - app.js', err  )   //helps to format error in your own way     //formatError() is deprocated and replaced by customFormatErrorFn()
    if(!err.originalError){ //originalError is the error returned by GraphQL
        return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error occurred';
    const code = err.originalError.code || 500;
    return { message: message, status: code, data: data };
  }
})) 

mongoose.connect('mongodb+srv://admin-vishal:OiXu0VqZrnApu31L@cluster0.tqqbw.mongodb.net/graphQL?w=majority')
.then(result => {
  app.listen(process.env.PORT || 3000, (err) => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)
      if (!err) {
        console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
      } else console.log(err)
    })
})
.catch(err => console.log(err));



