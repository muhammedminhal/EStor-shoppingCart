var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path')
var jwt = require('jsonwebtoken');
const { decode } = require('punycode');
var objectId = require('mongodb').ObjectId
var adminController = require('../contollers/admin')


// image file uploading multer====================================================================================
router.use(express.static(__dirname + "./public/"));

var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: Storage
}).single('file')
// ===================================================

// login route
router
  .get('/login', (req, res) => {
    res.render('admin/login')
  })



// Admin Dashboard
router
  .get("/profile", adminController.adminProfile)

  // users route

  .get("/Users", adminController.users)

// user add route

router.get('/useradd', (req, res) => {
  res.render("admin/userAdd")
})

  // edit user route

  .get("/useredit/:id", adminController.userEdit)

  // user delete route

  .get('/userdelete/:id', adminController.userDelete)

  // Products route
  .get("/Products", adminController.Products)

  // add products route

  .get('/addproduct', upload, (req, res) => {
    res.render("admin/productAdd")
  })

  // edit product route
  .get("/productedit/:id", adminController.productsEdit)


  // products delete route
  .get('/delete/:id', adminController.productDelete)

  // Add user route


  // add Category
  .get("/category", adminController.categoryGet)

  // category edit
  .get("/category/:id", upload, adminController.category)

  //   delete category

  .get('/deletecategory/:id', adminController.categoryDelete)

  // category add
  .get("/categoryform", (req, res) => {
    res.render("admin/CategoryForm")
  })

  // logout admin
  .get('/logout', adminController.logout)

// post router

router
  // login post route
  .post("/login", adminController.adminLoginPost)

  // user add post 
  .post('/useradd', adminController.addUser)

  // user edit route
  .post("/useredit/:id", upload, adminController.userEditPost)

  // products add route
  .post('/addproduct', upload, adminController.addProduct)

  // products edit route
  .post("/productedit/:id", upload, adminController.productEditPost)

  // category post
  .post("/category/:id", upload, adminController.categoryPost)

  // category add

  .post("/categoryform", upload, adminController.categoryAdd)




module.exports = router;
