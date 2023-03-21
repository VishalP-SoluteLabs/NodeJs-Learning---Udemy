require('dotenv').config(); //to load environment file
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const users = [];


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
  res.render('home', { pageTitle: 'Add User' });
});

app.get('/users', (req, res, next) => {
  res.render('users', {
    pageTitle: 'User',
    users: users,
    hasUsers: users.length > 0
  });
});

app.post('/add-user', (req, res, next) => {
  users.push({ name: req.body.username });
  res.redirect('/users');
});



  app.listen(process.env.PORT || 3000, () => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

    console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
  }); 