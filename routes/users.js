const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      users = require('../controllers/users'),
      catchAsync = require('../utils/catchAsync'),
      { validateUser } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(validateUser, catchAsync(users.create));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(users.login));

router.get('/logout', users.logout);

module.exports = router;