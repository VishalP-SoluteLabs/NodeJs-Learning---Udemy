require('dotenv').config(); //to load environment file

const path = require('path'); // To use out of folder files also(folder files other than current folder)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const adminRoutes = require('./Routes/admin.js');
const shopRoutes = require('./Routes/shop.js');
const authRoutes = require('./Routes/auth.js');

const errorController = require('./controllers/error.js');
const User = require('./models/user.js');
const { MIMEType } = require('util');
const app = express();

const MONGODB_URI = 'mongodb+srv://admin-vishal:OiXu0VqZrnApu31L@cluster0.tqqbw.mongodb.net/shop-mongoose-File-handling?w=majority';
const store = new MongoDBStore({ //mongoDB store constructor
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');         // cb(error, destination of file you want to store)
  },
  filename: (req, file, cb) => {
    const currentDate = new Date().toISOString().slice(0, 13);
    const ext = path.extname(file.originalname);
    cb(null, currentDate + "-" + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  if(file.MIMEType === 'image/png' || file.MIMEType === 'image/jpg' ||file.MIMEType === 'image/jpeg' ){
    cb(null , true)    //true if we want to atore that file
  }
   else{
       cb(null, true)   //false if we don't want to atore that file
  }
}

app.set('view engine', 'ejs'); // Set the view engine as PUG here
app.set('views', 'views'); // Telling which folder to be considered as 'views'(in this case we have named as views only)

app.use(bodyParser.urlencoded({
  extended: false
})) //encoding the data
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public'))) //To excess static files saved in 'public' folder.
app.use('/images', express.static(path.join(__dirname, 'images'))) //To excess static files saved in 'images' folder.

app.use(   
  session({
    secret: 'my secret', //this will used for signing the hash which secretly stores our ID in the cookie 
    resave: false, //helps to not resave on every request or response
    saveUninitialized: false, //ensures that no session gets saved for a request where it doesn't need to be saved because nothing was changed about it
    store: store
  }));

app.use(csrfProtection);  
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use((req, res, next) => {
  //throw new Error('Sync Dummy')
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});
 
app.use('/favicon.ico', (req, res) => res.status(204)); //Browsers will by default try to request /favicon.ico from the root of a hostname, in order to show an icon in the browser tab.

// app.use((req, res, next) => {     //middleware to store that user in my request and use it from anywhere in my app conveniently
//     User.findById('6423d06b0082fb268b40d4e4')
//     .then(user =>{
//       req.user = user;      //attching Sequelize object to request, as sequelize is called by 'nodemon app.js' not by any req in the browser.
//       next();
//     })
//     .catch(err => console.log(err))
// })





app.use('/admin', adminRoutes) //Checks if routes start with /admin only

app.use(shopRoutes);

app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.redirect('/500'); 
  res.status(500).render('500', {
    pageTitle: 'Internal Server Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
});
})


mongoose
  .connect(MONGODB_URI)
  .then(result => {
   
    app.listen(process.env.PORT || 3000, (err) => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)
      if (!err) {
        console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
      } else console.log(err)
    })
  })
  .catch(err => console.log(err))
