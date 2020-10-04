var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");
const passport = require('passport');
const { jwtMiddleware } = require('../config/jwt');
const genPassword = require('../lib/passwordUtils').genPassword;
var session = require('express-session')
var flash = require('connect-flash')


// midlleware=====JWt================================================================================================

/* GET home page. */
router
.get('/', async function(req, res, next) {
  let token = req.cookies.accessToken
   var userEmail = req.cookies.userData;
  jwt.verify(token,"secret",async(err,decode)=>{
    if(err){
   
      try{
        const database =req.app.locals.db;
        const collection = database.collection('products')
        const Category = database.collection('category')
        const findProduct = await collection.find({})
        const categoryProject = await Category.find({})
        const result =[]
        const Data =[]
        await categoryProject.forEach(data => {
          Data.push(data)
          })
        await findProduct.forEach(docs => {
        result.push(docs)
        })
        res.render('users/index', { result:result,Data:Data ,login:false});
      }
      catch(err){
        throw err
      }
    }else{
      var userEmail = req.cookies.userData;
      try{
        const database =req.app.locals.db;
        const collection = database.collection('products')
        const Category = database.collection('category')
        const users = database.collection('users')
        await users.findOne(userEmail,async(err,docs)=>{
          if(!err){
            const findProduct = await collection.find({})
            const categoryProject = await Category.find({})
            const result =[]
            const Data =[]
            await categoryProject.forEach(data => {
              Data.push(data)
              })
            await findProduct.forEach(docs => {
            result.push(docs)
            })
            res.render('users/index', { result:result,Data:Data ,docs:docs,login:true});
          }
        })

      
      }
      catch(err){
        throw err
      }
    }
  })
  
})
// index route=====================================================================================





// login index=====================================================================================
router
.get("/signup",async(req,res)=>{
  res.render("users/signup",{login:false})
})

.post("/signup",async(req,res)=>{
  const saltHash = genPassword(req.body.password);
  const salt = saltHash.salt
  const hash = saltHash.Hash
  const error = []
  const email = {"email":req.body.email}
  try{
    const database =req.app.locals.db;
    const collection = database.collection('user');

    const userLoginData = {
      email :req.body.email,
      name:req.body.name,
      hash:hash,
      salt:salt
    }
     await collection.insertOne(userLoginData)
     console.log('req.userLoginData',userLoginData)
     await collection.findOne(email,(err,data)=>{


   if(data){
    if(req.body.email!=data.email){
      error.push({msg:"We Sorry for the Inconvnence Please Sign up later "})
    }if(req.body.email==data.email){
      error.push({msg:"You are already Signed Up"})
    }if(req.body.email==undefined || req.body.password==undefined){
      error.push({msg:"Please enter crendentials and submit"})
    }if(req.body.password!=req.body.comparepassword){
      error.push({msg:"The Pasword You re-enterd is wrong"})
      res.render("users/signup",{error:error,login:false})
    }else{
      res.redirect("/signin")
    }
   } 
})
  }
  catch(err){
    throw err
  }
 })

// google authentication--------------------------------------------------------------------------------------------------
 router.get('/auth/google',
 passport.authenticate('google', { scope: ["profile", "email"]}),(req,res)=>{
 }
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users/signin' }),
  (req, res)=> {
  
    res.cookie("userData", req.user.ops[0].email); 
    var tokenData ={
      email : req.body.email
  }
  let token = jwt.sign(tokenData,"secret",{expiresIn:86400})
  res.cookie(
      'accessToken',
      token,{
          maxAge:365*24*60*60*100
  });
    // Successful authentication, redirect home.
    res.redirect('/');
});


// google authentication end==================================================================----------------------------------------------------------------------------------
 router
.get("/signin",async(req,res)=>{
  let message = req.flash('error')
  res.render("users/signin",{message:message,hasError:message.length>0})
})

router
.post('/signin',passport.authenticate('local',{failureRedirect:'/signin',failureFlash:true}),(req,res)=>{
  // cookie for user
  res.cookie("userData", req.body.email); 
  // jwt token
  var tokenData ={
    email : req.body.email
    
}
let token = jwt.sign(tokenData,"secret",{expiresIn:86400})
// cookie for jwt
res.cookie(
    'accessToken',
    token,{
        maxAge:365*24*60*60*100
});
res.redirect('/')
res.render('partials/loginheader')
}
);


// logout ==========================================================================================================================
router.get('/logout',async(req,res)=>{
  req.logout()
  req.session.destroy()
  res.clearCookie("accessToken");
  
  try{
    const database =req.app.locals.db;
    const collection = database.collection('products')
    const Category = database.collection('category')
    const findProduct = await collection.find({})
    const categoryProject = await Category.find({})
    const result =[]
    const Data =[]
    await categoryProject.forEach(data => {
      Data.push(data)
      })
    await findProduct.forEach(docs => {
    result.push(docs)
    })
    res.render('users/index', { result:result,Data:Data ,login:false});

    console.log("all images",result)
  }
  catch(err){
    throw err
  }
})





module.exports = router;
