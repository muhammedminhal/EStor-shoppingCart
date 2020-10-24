var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
var multer = require('multer')
var path = require('path')
var objectId = require('mongodb').ObjectId
var sharp = require('sharp')
var express = require('express');
var app = express();
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('../config/jwt');
var userController = require('../contollers/user')



// image file uploading multer====================================================================================
var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, objectId() + "-" + file.originalname)
  }
})
var upload = multer({
  storage: Storage
}).single('file')


router
  .get('/upload', userController.uploadsGet)

  /* GET users listing. seller myFUll products  start============================================================ */

  .get("/sellerview", userController.sellerViewGet)

  // seller product view
  .get('/sellerProduct/:id', userController.sellerProductGet)

  /* GET users listing. user single products  start ==========================================================================*/
  .get('/product/:id', userController.product)

  /* GET users listing. user myFUll products  End========================================================================= */

  .get('/category/:name', userController.categoryGet)

  // users products edit route

  .get("/edit/:id", userController.editGet)

  // product delete
  .get('/delete/:id', userController.deleteGet)

  // user profile
  .get('/profile', userController.profileGet)

  // user edit
  .get('/editprofile', userController.editProfileGet)

  // chat
  // .get('/chat/:email/:selleremail', userController.chatGet)

  .get('/chat',logedIn, userController.chatGet)

  .get('/sellerChat', userController.sellerChat)

  .get('/notification', userController.notification)




// Post
router
  // seller form
  .post('/upload', userController.uploadPost)
  // fileplload
  .post('/fileupload', userController.fileUpload)
  // product edit route
  .post("/edit/:id", upload, userController.editPost)
  // edit profile
  .post('/editprofile', userController.profileEditPost)
  // user profile
  .post('/profile', userController.profilePost)
  // buyer warning sent to seller through axios from client
  .post('/crate/warning', userController.warning)
  //Delete notification
   .post("/notificationDelete",userController.delete)

function logedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}


module.exports = router;