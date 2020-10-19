var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");
const passport = require('passport');
const { jwtMiddleware } = require('../config/jwt');
const genPassword = require('../lib/passwordUtils').genPassword;
var session = require('express-session')
var flash = require('connect-flash')

exports.index = async function(req, res) {
    var userEmail = req.cookies.userData;
 
  
        try{
          const database =req.app.locals.db;
          const collection = database.collection('products')
          const Category = database.collection('category')
          const users = database.collection('user')
          var email ={"email":userEmail}
          var userEmail = req.cookies.userData;
          await users.findOne(email,async(err,docs)=>{
         
            if(docs){
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
          res.render('users/index', { result:result,docs:docs ,Data:Data,login:true});
            }else{
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
              res.render('users/index', { result:result ,Data:Data,login:false});
            }
          })       
        }
        catch(err){
          throw err
        }
    }

// signup get function
    exports.userSignupGet =async(req,res)=>{
        res.render("users/signup",{login:false})
      }

    //   signup post function
    exports.userSignupPost =async(req,res)=>{
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
       }

// google auth post
    exports.googleAuthPost =(req, res)=> {
  
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
    }


    exports.signInGet =async(req,res)=>{
        let message = req.flash('error')
        res.render("users/signin",{message:message,hasError:message.length>0})
      }
    

      exports.signInPost =(req,res)=>{
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
      }

      exports.logOut =async(req,res)=>{
        req.logout()
        req.session.destroy()
        res.clearCookie("accessToken");
        res.clearCookie("userData");
       
        
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
      }



      // -----------------------


