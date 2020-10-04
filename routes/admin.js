var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path')
var jwt = require('jsonwebtoken');
const { decode } = require('punycode');
var objectId = require('mongodb').ObjectId

// image file uploading multer====================================================================================
router.use(express.static(__dirname+"./public/"));

var Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
})

var upload = multer({
  storage:Storage
}).single('file')
// ===================================================

// login route
router
.get('/login',(req,res)=>{
 res.render('admin/login')
})


.post("/login",(req,res)=>{
    console.log(req.body)
    if(req.body.name==="admin" && req.body.psw=="admin"){
         var tokenData ={
             name :"admin"
         }
         let token = jwt.sign(tokenData,"secret",{expiresIn:86400})
         res.cookie(
             'accessToken',
             token,{
                 maxAge:365*24*60*60*100
         });
         res.status(200)
        res.redirect('/admin/profile')
    }else{
        console.log("error")
    }
})

// Admin Dashboard
router
.get("/profile",async(req,res)=>{
    let token = req.cookies.accessToken
    jwt.verify(token,"secret",async(err,decode)=>{
        if(err){
            console.log(err)
            res.status(401)
            res.render('admin/login',{msg:"You Are Not an Autherised User Please login"})
        }else{
            try{
                const database= req.app.locals.db;
            
                const usersCollection = await database.collection('user')
                const productCollection = await database.collection('products')
                const Products = await productCollection.find({})
                const products =[]
                await Products.forEach((data)=>{
                    products.push(data)
                })
                var Users= await usersCollection.find({}); 
                const userData = [];
                await Users.forEach(data=>{
                    userData.push(data)
                })
                console.log(userData)
                res.render("admin/index",{
                    userData:userData,products:products
            })
            }
            catch(err){
                throw err
            }
            console.log('decoode',decode)
        }
    })
})


// users route
router
.get("/Users",async(req,res)=>{
    let token = req.cookies.accessToken
    jwt.verify(token,"secret",async(err,decode)=>{
        if(err){
            console.log(err)
            res.status(401)
            res.render('admin/login',{msg:"You Are Not an Autherised User Please login"})
        }else{
            try{
                const database= req.app.locals.db;
            
                const usersCollection = await database.collection('user')
                var Users= await usersCollection.find({}); 
                const userData = [];
                await Users.forEach(data=>{
                    userData.push(data)
                })
                console.log(userData)
                res.render("admin/Users",{
                    userData:userData
            })
            }
            catch(err){
                throw err
            }
            console.log('decoode',decode)
        }
    })
})

// user add route

router.get('/useradd',(req,res)=>{
    res.render("admin/userAdd")
    })
    .post('/useradd',async(req,res)=>{
        try{
            const adminAddUsers = {
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                address:req.body.address,
                password:req.body.password
            }
            const database = req.app.locals.db
            const result =await database.collection('user').insertOne(adminAddUsers)
            res.redirect('/admin/profile')
        }
        catch(err){
            throw err
        }
    })
    



// edit user route

router
  .get("/useredit/:id", async (req, res) => {

    const editParams = { "_id": objectId(req.params.id) }

    try {
      const database = req.app.locals.db;
      const collection = database.collection('user')
      const productsEdit = await collection.findOne(editParams, (err, data) => {
        if (!err) {
          res.render("admin/editUser", { data: data, login: true })
        } else {
          console.log("error")
        }
      })
    }
    catch (err) {
      throw err
    }
  })



.post("/useredit/:id", upload, async (req, res) => {
    const editParams = { "_id": objectId(req.params.id) }
    const updateProduct = {
      $set: {
        name: req.body.name,
        email: req.body.email,
        Mobile: req.body.Mobile,
        Address: req.body.Address,

      }
      
    };
    const option = { upsert: false }
    
    try {
      const database = req.app.locals.db;
      const collection = database.collection('user')
      await collection.updateOne(editParams, updateProduct,option)
      console.log(updateProduct, "edit par", editParams)
      res.redirect("/admin/Users")
    }
    catch (err) {
      throw err
    }
  })
// user delete route

router.get('/userdelete/:id', async (req, res) => {
    const deleteParams = { "_id": objectId(req.params.id) }
    console.log("deleteparam", deleteParams)
    try {
      const database = req.app.locals.db;
      const collection = await database.collection('user')
      collection.deleteOne( deleteParams , (err, data) => {
        if (!err) {
          console.log("item deleted", data)
          res.redirect('/admin/Users')
        }
      })
    }
    catch (err) {
      throw err
    }
  })


// Products route
.get("/Products",async(req,res)=>{
    let token = req.cookies.accessToken
    jwt.verify(token,"secret",async(err,decode)=>{
        if(err){
            console.log(err)
            res.status(401)
            res.render('admin/login',{msg:"You Are Not an Autherised User Please login"})
        }else{
            try{
                const database= req.app.locals.db;
                const productCollection = await database.collection('products')
                const Products = await productCollection.find({})
                const products =[]
                await Products.forEach((data)=>{
                    products.push(data)
                })
                res.render("admin/Products",{
                products:products
            })
            }
            catch(err){
                throw err
            }
        }
    })
})

// add products route

router.get('/addproduct',upload,(req,res)=>{
    res.render("admin/productAdd")
    })
    .post('/addproduct',upload,async(req,res)=>{
        const photo = req.file.filename
        try{
            const products = {
                itemName: req.body.itemName,
                category: req.body.category,
                location: req.body.location,
                Date: req.body.Date,
                Description: req.body.Description,
                image: photo,
                userData:"admin"
        
              }
            const database = req.app.locals.db
            const result =await database.collection('products').insertOne(products)
            console.log(req.body)
            res.redirect('/admin/profile')
        }
        catch(err){
            throw err
        }
    })
    
// edit product route
router
  .get("/productedit/:id", async (req, res) => {

    const editParams = { "_id": objectId(req.params.id) }

    try {
      const database = req.app.locals.db;
      const collection = database.collection('products')
      const productsEdit = await collection.findOne(editParams, (err, data) => {
        if (!err) {
          res.render("admin/editProduct", { data: data, login: true })
        } else {
          console.log("error")
        }
      })
    }
    catch (err) {
      throw err
    }
  })



.post("/productedit/:id", upload, async (req, res) => {
    const editParams = { "_id": objectId(req.params.id) }
    const updateProduct = {
      $set: {
        itemName: req.body.itemName,
        category: req.body.category,
        location: req.body.location,
        Date: req.body.Date,
        Description: req.body.Description,

      }
    };
    const option = { upsert: false }
    try {
      const database = req.app.locals.db;
      const collection = database.collection('products')
      await collection.updateOne(editParams, updateProduct, option)
      res.redirect("/admin/Products")
    }
    catch (err) {
      throw err
    }
  })
// products delete route
router.get('/delete/:id', async (req, res) => {
    const deleteParams = { "_id": objectId(req.params.id) }
    console.log("deleteparam", deleteParams)
    try {
      const database = req.app.locals.db;
      const collection = await database.collection('products')
      collection.deleteOne( deleteParams , (err, data) => {
        if (!err) {
          console.log("item deleted", data)
          res.redirect('/admin/Products')
        }
      })
    }
    catch (err) {
      throw err
    }
  })

// Add user route


// add Category
.get("/category",async(req,res)=>{
    let token = req.cookies.accessToken
    jwt.verify(token,"secret",async(err,decode)=>{
        if(err){
            console.log(err)
            res.status(401)
            res.render('admin/login',{msg:"You Are Not an Autherised User Please login"})
        }else{
            try{
                const database= req.app.locals.db;
                const productCollection = await database.collection('category')
                const category = await productCollection.find({})
                const Category =[]
                await category.forEach((data)=>{
                    Category.push(data)
                })
                res.render("admin/category",{
                    Category:Category
            })
            }
            catch(err){
                throw err
            }
        }
    })
})

// category edit
router
  .get("/category/:id",upload, async (req, res) => {

    const editParams = { "_id": objectId(req.params.id) }

    try {
      const database = req.app.locals.db;
      const collection = database.collection('category')
      const productsEdit = await collection.findOne(editParams, (err, data) => {
        if (!err) {
          res.render("admin/editCategory", { data: data})
        } else {
          console.log("error")
        }
      })
    }
    catch (err) {
      throw err
    }
  })

  .post("/category/:id", upload, async (req, res) => {
    const editParams = { "_id": objectId(req.params.id) }
    const categoryImage = req.file.filename
    const updateProduct = {
      $set: {
       name: req.body.name,
       image:categoryImage
      }
    };
    const option = { upsert: false }
    try {
      const database = req.app.locals.db;
      const collection = database.collection('category')
      await collection.updateOne(editParams, updateProduct, option)
      res.redirect("/admin/category")
    }
    catch (err) {
      throw err
    }
  })

//   delete category

router.get('/deletecategory/:id', async (req, res) => {
    const deleteParams = { "_id": objectId(req.params.id) }
    try {
      const database = req.app.locals.db;
      const collection = await database.collection('category')
      collection.deleteOne( deleteParams , (err, data) => {
        if (!err) {
          console.log("item deleted", data)
          res.redirect('/admin/category')
        }
      })
    }
    catch (err) {
      throw err
    }
  })



// category add
router
.get("/categoryform",(req,res)=>{
    res.render("admin/CategoryForm")
})
.post("/categoryform",upload,async(req,res)=>{
    const imageName  = req.file.filename
    try{
        const adminAddCategory = {
            name: req.body.name,
            image:imageName
        }
        const database = req.app.locals.db
        await database.collection('category').insertOne(adminAddCategory)
        res.redirect('/admin/category')
    }
    catch(err){
        throw err
    }
})


// logout admin

router.get('/logout',(req,res)=>{
    req.logout()
    req.session.destroy()
    res.clearCookie("accessToken");
    res.redirect('/')
})


module.exports = router;
