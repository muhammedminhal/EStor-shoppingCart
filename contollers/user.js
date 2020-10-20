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

var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, objectId() + "-" + file.originalname)
  }
})
var upload = multer({
  storage: Storage
}).single('file')



exports.uploadsGet =  async (req, res) => {
  let token = req.cookies.accessToken

  jwt.verify(token, 'secret', async (err, paylod) => {
    if (err) {
      res.redirect('/signin')
    } else {
      const database = req.app.locals.db;
      const Category = database.collection('category')
      const users = database.collection('user')
      var userEmail = req.cookies.userData;
          var email ={"email":userEmail}
        
  
          await users.findOne(email,async(err,docs)=>{
         
            if(!err){
              const categoryList = await Category.find({})
              const Data = []
              await categoryList.forEach(data => {
                Data.push(data)
              })
              res.render('users/sellerForm', { data: Data,docs:docs, login: true })
            }else{
              console.log("no dataa fetched",err)
            }
          })
    }
  })
}

exports.uploadPost = async (req, res) => {

  let token = req.cookies.accessToken

  jwt.verify(token, "secret", async (err, decode) => {

    if (err) {
      console.log(err)
      res.status(401)
      res.render('users/signin', { msg: "You are not an Autherised user please sign in" })
    } else {
      const imageName = req.body.image
  
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
           
          }
        })
      }
      catch (err) {
        throw err
      }
    }
  })
}

exports.fileUpload = (req,res)=>{

  
  upload(req, res, async function(err) {
    if (!req.file) {
      console.log("No file")
      return { status: 'failed', message: 'No image to upload' };
    }
    if (err instanceof multer.MulterError) {
      console.log("No file")
      return res.status(500).json(err);
    } else if (err) {
      console.log("No file")

      return res.status(500).json(err);
    }
    
    res.send(req.file.filename)
 
  })
}

exports.sellerViewGet = async (req, res,next) => {
  let token = req.cookies.accessToken
  var userEmail = req.cookies.userData;
  const email = { "email": userEmail }

  jwt.verify(token, "secret", async (err, decode) => {
    if (err) {
     res.redirect('/signin')
    } else {
      try {
        const db = req.app.locals.db
        await db.collection('user').findOne(email, async (err, data) => {
          if (!err) {
            var userData = data._id
            const database = req.app.locals.db;
            const collection = database.collection('products')
            const findProduct = await collection.find({ "userdata": userData })
            const result = []
            await findProduct.forEach(docs => {
              result.push(docs)
            })
            res.render('users/sellerView', { docs: result,data:data, login: true })
          } else {
         console.log(err)
          }
        })
      }
      catch (err) {
        throw err
      }
    }

  });

}

exports.sellerProductGet = async (req, res) => {
  const idSeller = { '_id': objectId(req.params.id) };

  try {
    const database = req.app.locals.db
    const singleProducts = await database.collection('products')
    const users = database.collection('user')
    var userEmail = req.cookies.userData;
        var email ={"email":userEmail}
        await users.findOne(email,async(err,data)=>{
          if(!err){
            await singleProducts.findOne(idSeller, (err, docs) => {
              if (err) {
                throw err
              } else {
                res.render("users/sellerProduct", { docs: docs,data:data, login: true })
              }
            })
          }
        })

  }
  catch (err) {
    throw err
  }
}

exports.product = async (req, res) => {
  let token = req.cookies.accessToken
  var userEmail = req.cookies.userData;

  const email = { "email": userEmail }
  jwt.verify(token, "secret", async (err, decode) => {
    if (err) {
      const id = { '_id': objectId(req.params.id) };
      try {
        const database = req.app.locals.db
        const singleProducts = await database.collection('products')
        await singleProducts.findOne(id, async (err, docs) => {
          var userId = docs.userdata
          var userID = { "_id": objectId(userId) }
          await database.collection('user').findOne(userID, async (err, data) => {
            await database.collection('user').findOne(email, (err, user) => {
              if (!err) {
                res.render("users/product", { docs: docs, user: user, data: data, login: false })
              } else {
                throw err
              }
            })
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
    
          var userID = { "_id": objectId(userId) }
          await database.collection('user').findOne(userID, async (err, data) => {
            await database.collection('user').findOne(email, (err, user) => {
              if (!err) {
                res.render("users/product", { docs: docs, user: user, data: data, login: true })
              } else {
                throw err
              }
            })
          })
        })
      }
      catch (err) {
        throw err
      }
    }
  })
}

exports.categoryGet = async (req, res) => {
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
        res.render('users/category', { foundCategory: foundCategory, category: Category, login: false })
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
        const users = database.collection('user')
        var userEmail = req.cookies.userData;
        var email ={"email":userEmail}
      
        await users.findOne(email,async(err,docs)=>{
          if(!err){
            await findCategory.forEach(data => {
              foundCategory.push(data)
            })
            if (findCategory == undefined) {
              foundCategory.push({ msg: "There is nothing to view" })
            }
            res.render('users/category', { foundCategory: foundCategory,docs:docs, category: Category, login: true })
           
          }else{
            console.log(err);
          }
        })   
      }
      catch (err) {
        res.status(200)
        throw err
      }
    }
  })
}

exports.editGet = async (req, res) => {

  const editParams = { "_id": objectId(req.params.id) }

  try {
    const database = req.app.locals.db;
    const collection = database.collection('products')
    const users = database.collection('user')
    var userEmail = req.cookies.userData;
    var email ={"email":userEmail}


    await users.findOne(email,async(err,docs)=>{
      if(!err){
        const productsEdit = await collection.findOne(editParams, (err, data) => {
          if (!err) {
            res.render("users/edit", { data: data,docs:docs, login: true })
   
          } else {
            console.log("error")
          }
        })
      }
    })
  }
  catch (err) {
    throw err
  }
}

exports.editPost = async (req, res) => {
  const editParams = { "_id": objectId(req.params.id) }
  const image = req.file.filename


  const updateProduct = {
    $set: {
      itemName: req.body.itemName,
      category: req.body.category,
      location: req.body.location,
      Date: req.body.Date,
      Description: req.body.Description,
      image: image

    }
  };
  const option = { upsert: false }

  try {
    const database = req.app.locals.db;
    const collection = database.collection('products')
    await collection.updateOne(editParams, updateProduct, option)
    res.redirect("/users/sellerview")
  }
  catch (err) {
    throw err
  }
}

exports.deleteGet = async (req, res) => {
  const editParams = { "_id": objectId(req.params.id) }

  try {
    const database = req.app.locals.db;
    const collection = await database.collection('products')
    collection.deleteOne(editParams, (err, data) => {
      if (!err) {
        res.redirect('/users/sellerview')
      }
    })
  }
  catch (err) {
    throw err
  }
}


exports.profileGet = async (req, res) => {
  let token = req.cookies.accessToken
  jwt.verify(token, 'secret', async (err, decode) => {
    if (err) {
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, data) => {
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/profile', { data: data, login: false })
        }
      })
    } else {
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, data) => {
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/profile', { data: data, login: true })
        }
      })
    }
  })
}

exports.profilePost = async (req, res) => {
  let userEmail = req.cookies.userData
  const imageName = req.body.image

 

  const email = { "email": userEmail }
  const updateProduct = {
    $set: {
      image:imageName,
      mobile: req.body.mobile,
      address: req.body.address,
    }
  };

  try {
    const database = req.app.locals.db;
    const collection = database.collection('user')
    await collection.updateOne(email, updateProduct)
    res.redirect("/")
  }
  catch (err) {
    throw err
  }
}

exports.editProfileGet = async (req, res) => {
  let token = req.cookies.accessToken
  jwt.verify(token, 'secret', async (err, decode) => {
    if (err) {
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, docs) => {
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/editprofile', { docs: docs, login: false })
        }
      })
    } else {
      var userEmail = req.cookies.userData;
      const email = { "email": userEmail }
      const db = req.app.locals.db
      await db.collection('user').findOne(email, async (err, docs) => {
        if (err) {
          console.log(err)
          res.status(500)
        } else {
          res.render('users/editprofile', { docs: docs, login: true })
        }
      })
    }
  })
}


exports.profileEditPost = async (req, res) => {
  let userEmail = req.cookies.userData
  const email = { "email": userEmail }

  const updateProduct = {
    $set: {
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,
    }
  };

  try {
    const database = req.app.locals.db;
    const collection = database.collection('user')
    await collection.updateOne(email, updateProduct)

    res.redirect("/users/profile")
  }
  catch (err) {
    throw err
  }
}

exports.chatGet = async (req, res) => {
  let token = req.cookies.accessToken
  jwt.verify(token,'secret',async(err,decode)=>{
    if(err){
      res.redirect('/signin')
    }else{
      var userEmail = req.cookies.userData;
      var sellerEmail = req.params.selleremail;
      const useremail = { "email": userEmail } 
      try {
        const database = req.app.locals.db;
        await database.collection('user').findOne(useremail, async (err, data) => {
          if (!err) {
            var data = {
              sEmail: sellerEmail,
              uEmail: data.email
            }
            await database.collection('chat').insertOne(data)

            console.log("emailghhvhbvbhvbhvbhvhvhvhvvvhvhbvhvgcddcggcghn ffvgbfvffdfygfb")

            res.render('users/chat', { data: data,login: true })
          }
        })
      }
      catch (err) {
        throw err
      }
    }
  })
}

exports.sellerChat = async (req, res) => {
  res.render('users/chat')

}

exports.notification = async (req, res) => {
  let userEmail = req.cookies.userData

  let email = { "sEmail": userEmail }
  console.log("minhal ckookie",email);
  try {
    var database = req.app.locals.db;
    let chat = await database.collection('chat').find(email)
    var ChatData = []
    await chat.forEach(data => {
      ChatData.push(data)
    })
  console.log("aray data",ChatData);
    res.render('users/notifications', { docs: ChatData,login: true })

  } catch (err) {
    throw err
  }
}

exports.warning = async (req, res) => {
  uemail = req.body.uEmail
  semail = req.body.sEmail
  try {
    var database = req.app.locals.db;
    await database.collection('chat').insertOne({
      uEmail: uemail,
      sEmail: semail
    })
  } catch (err) {
    throw err
  }
}