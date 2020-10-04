var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
var multer = require('multer')
var path = require('path')
var objectId = require('mongodb').ObjectId
// var sharp = require('multer-sharp-resizer')
var sharp = require('sharp')


var jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('../config/jwt');

// image file uploading multer====================================================================================
var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

var upload = multer({
  storage: Storage
}).single('file')


// =================================================================================================================
/* GET users listing. seller form  */
// seller get mode route=================================================================
router
  .get('/upload',logedIn, async (req, res) => {
    let token = req.cookies.accessToken
    jwt.verify(token, 'secret', async (err, paylod) => {
      if (err) {
        const database = req.app.locals.db;
        const Category = database.collection('category')
        const categoryList = await Category.find({})
        const Data = []
        await categoryList.forEach(data => {
          Data.push(data)
        })
        res.render('users/sellerForm', { data: Data, login: false })
      } else {
        const database = req.app.locals.db;
        const Category = database.collection('category')
        const categoryList = await Category.find({})
        const Data = []
        await categoryList.forEach(data => {
          Data.push(data)
        })
        res.render('users/sellerForm', { data: Data, login: true })
      }
    })
  })
  // seller mode post=============================================================
  .post('/upload',logedIn, upload, async (req, res) => {
    let token = req.cookies.accessToken
    console.log(token)
    jwt.verify(token, "secret", async (err, decode) => {
      console.log("decode", decode)
      if (err) {
        console.log(err)
        res.status(401)
        res.render('users/signin', { msg: "You are not an Autherised user please sign in" })
      } else {
        const imageName = req.file.filename
        const success = req.file.filename + "file uploaded successfully"
        res.redirect("/users/sellerview")

        try {
          var userEmail = req.cookies.userData;
          const email = { "email": userEmail }
          const db = req.app.locals.db
          await db.collection('user').findOne(email, async (err, data) => {

            if (!err) {
              const userData = data._id

              const products = {
                itemName: req.body.itemName,
                category: req.body.category,
                location: req.body.location,
                Date: req.body.Date,
                Description: req.body.Description,
                image: imageName,
                userdata: userData
              }
              const database = req.app.locals.db
              await database.collection('products').insertOne(products)
              console.log("userdatainu", userData, "prodcts", products)
            }
          })
        }
        catch (err) {
          throw err
        }
      }
    })
  })

/* GET users listing. seller form  END=================================================================================== */

/* GET users listing. seller myFUll products  start============================================================ */

router
  .get("/sellerview",logedIn, async (req, res) => {
    var userEmail = req.cookies.userData;
    const email = { "email": userEmail }
    try {
      const db = req.app.locals.db
      await db.collection('user').findOne(email,async(err,data)=>{
        if(err){
console.log('err')
        }else{
          var userData = data._id
          const database = req.app.locals.db;
          const collection = database.collection('products')
          const findProduct = await collection.find({"userdata":userData})
          const result = []
          await findProduct.forEach(docs => {
            result.push(docs)
          })
          res.render('users/sellerView', { docs: result, login: true })
        }
      })
    }
    catch (err) {
      throw err
    }
  })

router
  .get('/sellerProduct/:id', async (req, res) => {
    const idSeller = { '_id': objectId(req.params.id) };
    console.log('this is params id', idSeller)
    try {
      const database = req.app.locals.db
      const singleProducts = await database.collection('products')
      await singleProducts.findOne(idSeller, (err, docs) => {
        if (err) {
          throw err
        } else {
          res.render("users/sellerProduct", { docs: docs, login: true })
        }
      })
    }
    catch (err) {
      throw err
    }
  })


/* GET users listing. seller myFUll products  END================================================================= */



/* GET users listing. user single products  start ==========================================================================*/
router
  .get('/product/:id', async (req, res) => {
    let token = req.cookies.accessToken
    jwt.verify(token, "secret", async (err, decode) => {
      if (err) {
        const id = { '_id': objectId(req.params.id) };

        try {
          const database = req.app.locals.db
          const singleProducts = await database.collection('products')
          await singleProducts.findOne(id, async (err, docs) => {

            var userId = docs.userdata
            console.log("userID", userId)
            var userID = { "_id": objectId(userId) }
            await database.collection('user').findOne(userID, (err, data) => {
              if (!err) {
                res.render("users/product", { docs: docs, data: data, login: false })
              } else {
                throw err
              }
            })
          })
        }
        catch (err) {
          throw err
        }
      } else {
        const id = { '_id': objectId(req.params.id) };
        try {
          const database = req.app.locals.db
          const singleProducts = await database.collection('products')
          await singleProducts.findOne(id, async (err, docs) => {
            var userId = docs.userdata
            console.log("userID", userId)
            var userID = { "_id": objectId(userId) }
            await database.collection('user').findOne(userID, (err, data) => {
              if (!err) {
                res.render("users/product", { docs: docs, data: data, login: true })
              } else {
                throw err
              }
            })

          })
        }
        catch (err) {
          throw err
        }
      }
    })
  })



/* GET users listing. user myFUll products  End========================================================================= */


router.get('/category/:name', async (req, res) => {
  let token = req.cookies.accessToken
  jwt.verify(token, "secret", async (err, decode) => {
    if (err) {
      var Category = req.params.name

      try {
        const database = req.app.locals.db;
        const categoryCollection = await database.collection('products')
        const findCategory = await categoryCollection.find({ "category": Category })
        const foundCategory = [];
        await findCategory.forEach(data => {
          foundCategory.push(data)
        })
        res.render('users/category', { foundCategory: foundCategory,category:Category, login: false })
      }
      catch (err) {
        res.status(200)
        throw err
      }
    } else {
      var Category = req.params.name
      try {
        const database = req.app.locals.db;
        const categoryCollection = await database.collection('products')
        const findCategory = await categoryCollection.find({ "category": Category })
        const foundCategory = [];
        await findCategory.forEach(data => {
          foundCategory.push(data)
        })
        if (findCategory == undefined) {
          foundCategory.push({ msg: "There is nothing to view" })
        }
        res.render('users/category', { foundCategory: foundCategory,category:Category, login: true })
        console.log('daata', foundCategory)
      }
      catch (err) {
        res.status(200)
        throw err
      }
    }
  })
})


// users products edit route
router
  .get("/edit/:id", async (req, res) => {

    const editParams = { "_id": objectId(req.params.id) }

    try {
      const database = req.app.locals.db;
      const collection = database.collection('products')
      const productsEdit = await collection.findOne(editParams, (err, data) => {
        if (!err) {
          res.render("users/edit", { data: data, login: true })
          console.log("product data",data)
        } else {
          console.log("error")
        }
      })
    }
    catch (err) {
      throw err
    }
  })


  .post("/edit/:id",upload, async (req, res) => {
    const editParams = { "_id": objectId(req.params.id) }
    const image = req.file.filename
    console.log("edit set" ,req.body)
    
    const updateProduct = {
      $set: {
        itemName: req.body.itemName,
        category: req.body.category,
        location: req.body.location,
        Date: req.body.Date,
        Description: req.body.Description,
        image:image
     
      }
    };
    const option = { upsert: false }
   
    try {
      const database = req.app.locals.db;
      const collection = database.collection('products')
      await collection.updateOne(editParams, updateProduct,option)
      console.log(updateProduct, "edit par", editParams)
      res.redirect("/users/sellerview")
    }
    catch (err) {
      throw err
    }
  })

  // product delete


router.get('/delete/:id', async (req, res) => {
  const editParams = { "_id": objectId(req.params.id) }
  console.log("deleteparam", editParams)
  try {
    const database = req.app.locals.db;
    const collection = await database.collection('products')
    collection.deleteOne(editParams,(err, data) => {
      if (!err) {
        console.log("item deleted", data)
        res.redirect('/users/sellerview')
      }
    })
  }
  catch (err) {
    throw err
  }
})

// user profile


router.get('/profile', async (req, res) => {
  let token = req.cookies.accessToken
  jwt.verify(token,'secret',async(err,decode)=>{
    if(err){
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, data) => {
        console.log("profile", data)
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/profile', { data: data ,login:false})
        }
      })
    }else{
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, data) => {
        console.log("profile", data)
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/profile', { data: data ,login:true})
        }
      })
    }
  })
 
})




// router.post('/editprofile', async(req,res)=>{
//   let userData = req.cookies.userdata
//   const updateProduct = {
//     $set: {

//      phone:req.body.phone,
//      about:req.body.about,
//     }
//   };
//   const option = { upsert: false }
//   try {
//     const database = req.app.locals.db;
//     const collection = database.collection('users')
//     await collection.updateOne(userData, updateProduct, option)
//     console.log(updateProduct, "edit par", userData)
//     res.redirect("/users/profilefound")
//   }
//   catch (err) {
//     throw err
//   }
// })



router.get('/profilefound', (req, res) => {
  res.send('data fond')
})

function logedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');

}


module.exports = router;