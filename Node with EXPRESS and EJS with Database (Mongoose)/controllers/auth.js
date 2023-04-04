const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');  //   /check - sub package of express-validator
require('dotenv').config();

const transporter = nodemailer.createTransport( //authentication and service name
  {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  }
);

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};


exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt
  .hash(password, 12)
  .then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] }
    });
    return user.save();
  })
    // .then(() => {
    //   res.redirect('/login');
    //   let details = {
    //     from: '19.vishal.pansuriya@gmail.com',
    //     to: email,
    //     subject: "SignUp Success!",
    //     html: '<h1>Your account has been successfully created!!</h1>'
    //   }
    //   return transporter.sendMail(details, (err) => { //send mail to new users
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log('Email sent') 
    //     }
    //   })
    // })
    .then(result => {
      req.session.isLoggedIn = true;
      res.redirect('/');
    })
    .catch(err => { 
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
    })
};

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get('Cookie').trim().split('=')[1] === 'true';
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => { 
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
    })
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}


exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/login');
        transporter.sendMail({
          to: req.body.email,
          from: 'ramesh@suresh.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => { 
        // res.redirect('/500')
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
      })
  });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now() //$gt represents greater than '>'
      }
    })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Update Password',
        errorMessage: message,
        userId: user._id.toString(), //convert ObjectId to string
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined; //To reset the token generated for reseting password
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}