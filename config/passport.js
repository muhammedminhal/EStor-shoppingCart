var passport  = require('passport')
var LocalStrategy = require('passport-local').Strategy
var mongoClient = require("mongodb").MongoClient
const validpassword = require('../lib/passwordUtils').validPassword;
var objectId = require('mongodb').ObjectId
var flash = require('connect-flash');
const jwtMIddelware = require('./jwt');
var jwt = require('jsonwebtoken');
const { reset } = require('nodemon');
var Strategy = require("passport-google-oauth20").Strategy



// database connection
mongoClient.connect('mongodb://localhost:27017',{ useUnifiedTopology: true },(err,client)=>{
    if(err){
      console.error(`error in db connection ${err}`)
    }else{
      console.log("mongod connected...")
  const database = client.db("eStore")
  // =====================================================================================================================

const customFields ={
    usernameField :'email',
    passwordField :"password"
}

const verifyCallback = async(email,password,done)=>{
    await database.collection('user').findOne({"email":email})
    .then((user)=>{
        if(!user){
            return done(null, false,{message:"No user found"});
        }
            const isValid = validpassword(password, user.hash, user.salt);
            if(isValid){ 
              var tokenData ={
                email : user.email
            }
            let token = jwt.sign(tokenData,"secret",{expiresIn:86400})
            
                return done(null,user);
            }else{
                return done(null, false,{message:"Email or Password is Incorrect"});
            }
    })
  .catch((err)=>{
      done(err)
  })   
}
const stategy = new LocalStrategy(customFields,verifyCallback);
passport.use(stategy);


// ==================================================================


const googleStategy = (new Strategy({
  clientID:"171396708837-mls44huqgu9cu79rofdbfou1q11iqdcr.apps.googleusercontent.com",
  clientSecret:"Ocl69bumYrREEE-p4hjjDBme",
  callbackURL:'http://localhost:3000/auth/google/callback'
},

 async(accessToken,refreshToken,profile,done)=>{
  await database.collection('user').findOne({"googleId":profile.id})

  .then(async(user)=>{
    if(user){
      return done(null,user);
    }else{
      let userProfile ={
        id:profile.id,
        email:profile.emails[0].value,
        name:profile.displayName
      }
      await database.collection('user').insertOne(userProfile).then((newuser)=>{
       return done(null,newuser)
      })
    }
  })
  .catch((err)=>{
    throw err
})
}
))

passport.use(googleStategy)

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
}
})




