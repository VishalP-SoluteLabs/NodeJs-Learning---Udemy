require('dotenv').config(); //to load environment file

const path = require('path') // To use out of folder files also(folder files other than current folder)

const express = require('express')
const bodyParser = require('body-parser')
   

const adminData = require('./Routes/admin.js')
const shopRoutes = require('./Routes/shop.js')

const app = express(); 


app.set('view engine', 'ejs');       // Set the view engine as PUG here
app.set('views', 'views');           // Telling which folder to be considered as 'views'(in this case we have named as views only)

app.use(bodyParser.urlencoded({ 
  extended: false
})) //encoding the data
app.use(express.static(path.join(__dirname, 'public'))) //To excess static files saved in 'public' folder.

app.use('/favicon.ico', (req, res) => res.status(204)); //Browsers will by default try to request /favicon.ico from the root of a hostname, in order to show an icon in the browser tab.

app.use('/admin', adminData.routes) //Checks if routes start with /admin only

app.use(shopRoutes)

app.use('/', (req, res) => {
  res.status(404).render('404', {pageTitle: 'Page Not Found'});
     //res.sendFile(path.join(__dirname, 'views', '404.html')); {path.join helps to make root directory as the folder we are working}
}); // after that we can define folder paths one by one and in last the file name


app.listen(process.env.PORT || 3000, () => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

  console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
}); 
