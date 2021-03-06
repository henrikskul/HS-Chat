const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    const { name, password, password2 } = req.body;
    let errors = [];
  
    if (!name || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        name,
        password,
        password2
      });
    } else {
      User.findOne({ name: name }).then(user => {
        if (user) {
          errors.push({ msg: 'Username already exists' });
          res.render('register', {
            errors,
            name,
            password,
            password2
          });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;
                const newUser = new User({
                    name,
                    password: hash
                });
                newUser
                .save()
                .then(user => {
                req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                );
                res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
        }
    });
    }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;