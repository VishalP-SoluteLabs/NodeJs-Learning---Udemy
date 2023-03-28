require('dotenv').config(); //to load environment file

const path = require('path'); // To use out of folder files also(folder files other than current folder)

const express    = require('express');
const bodyParser = require('body-parser');


const adminRoutes     = require('./Routes/admin.js');
const shopRoutes      = require('./Routes/shop.js');
const errorController = require('./controllers/error.js');
const sequelize       = require('./util/database.js');
const Product         = require('./models/product.js');
const User            = require('./models/user.js');
const Cart            = require('./models/cart.js');
const CartItem        = require('./models/cart-item.js');
const Order           = require('./models/order.js');
const OrderItem       = require('./models/order-item.js');

const app = express();


app.set('view engine', 'ejs'); // Set the view engine as PUG here
app.set('views', 'views'); // Telling which folder to be considered as 'views'(in this case we have named as views only)

app.use(bodyParser.urlencoded({
  extended: false
})) //encoding the data
app.use(express.static(path.join(__dirname, 'public'))) //To excess static files saved in 'public' folder.

app.use('/favicon.ico', (req, res) => res.status(204)); //Browsers will by default try to request /favicon.ico from the root of a hostname, in order to show an icon in the browser tab.

app.use((req, res, next) => {     //middleware to store that user in my request and use it from anywhere in my app conveniently
    User.findByPk(1)
    .then(user =>{
      req.user = user;      //attching Sequelize object to request, as sequelize is called by 'nodemon app.js' not by any req in the browser.
      next();
    })
    .catch(err => console.log(err))
})

app.use('/admin', adminRoutes) //Checks if routes start with /admin only

app.use(shopRoutes)

app.use(errorController.get404);


Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User); //Optional because it is only same as 'User.hasOne(Cart)' but in opposite direction, so one direction is enough
Cart.belongsToMany(Product, { through: CartItem }); // '{through: CartItem}'It defines where to store the connection items(assciated with this connection)( at which model to store we define here)
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User)
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem})

sequelize
.sync()  
// .sync({force: true})  //Setting 'force: true' because we already made some data so to overwrite with this updated information (relations that we add)
        //It syncs your all models by creating appropriate tables for them
.then(result => {
  return User.findByPk(1);    //Making or associating the dummy user
   //console.log(result)
})
.then(user => {
  if (!user) {
    return User.create({ name: 'Ramesh', email: 'ramesh@suresh.com' });  // Creating a dummy user manually
  }
  return user;    //if the user already exists, it will simply return it.
})  
.then(user => {
  return user.createCart();    //creating Cart model for the particular user
})
.then(user => {
  // console.log(user);
  app.listen(process.env.PORT || 3000, (err) => { //process.env.PORT:- it will fetch the variables stored in '.env' file (for this line the PORT variable)

    if (!err) {
      console.log(`Server listening at Port: ${process.env.PORT || 3000}`);
    } else console.log(err)
  
  });
})
.catch(err => console.log(err));       

