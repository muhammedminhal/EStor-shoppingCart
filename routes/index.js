var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");
const passport = require('passport');
const { jwtMiddleware } = require('../config/jwt');
const genPassword = require('../lib/passwordUtils').genPassword;
var session = require('express-session')
var flash = require('connect-flash')
var indexController = require('../contollers/index')




/* GET home page. */
router
  .get('/', indexController.index)
  // login index=====================================================================================
  .get("/signup", indexController.userSignupGet)

// google authentication--------------------------------------------------------------------------------------------------
router
  .get('/auth/google',
    passport.authenticate('google', { scope: ["profile", "email"] }));

router
  .get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/users/signin' }), indexController.googleAuthPost);

// google authentication end==================================================================----------------------------------------------------------------------------------
router
  .get("/signin", indexController.signInGet)

  // logout ==========================================================================================================================
  .get('/logout', indexController.logOut)

// post route

// signup route
router
  .post("/signup", indexController.userSignupPost)

  .post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), indexController.signInPost);

module.exports = router;
