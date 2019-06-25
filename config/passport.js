const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'name' }, (name, password, done) => {
      // Match user
      User.findOne({
        name: name
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That Username is not registered' });
        }
        // Match password
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
