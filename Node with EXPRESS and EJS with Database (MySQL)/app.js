require('dotenv').config(); //to load environment file

const path = require('path') // To use out of folder files also(folder files other than current folder)

const express = require('express');
const bodyParser = require('body-parser');


const adminRoutes = require('./Routes/admin.js');
const shopRoutes = require('./Routes/shop.js');
const errorController = require('./controllers/error.js');
const db = require('./util/database.js')

const app = express();


app.set('view engine', 'ejs'); // Set the view engine as PUG here
app.set('views', 'views'); // Telling which folder to be considered as 'views'(in this case we have named as views only)

app.use(bodyParser.urlencoded({
  extended: false
})) //encoding the data
app.use(express.static(path.join(__dirname, 'public'))) //To excess static files saved in 'public' folder.

app.use('/favicon.ico', (req, res) => res.status(204)); //Browsers will by default try to request /favicon.ico from the root of a hostname, in order to show an icon in the browser tab.

app.use('/admin', adminRoutes) //Checks if routes start with /admin only

app.use(shopRoutes)

app.use(errorController.get404);


app.listen(process.env.PORT || 3000, (err) => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

  if (!err) {
    console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
  } else console.log(err)

});
