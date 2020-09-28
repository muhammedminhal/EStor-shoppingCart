var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path')
var jwt = require('jsonwebtoken');
const { decode } = require('punycode');

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
            
                const usersCollection = await database.collection('users')
                var Users= await usersCollection.find({}); 
                const userData = [];
                await Users.forEach(data=>{
                    userData.push(data)
                })
                res.render("admin/profile",{
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
router.get('/add',(req,res)=>{
res.render("admin/add")
})
.post('/add',async(req,res)=>{
    try{
        const adminAddUsers = {
            name: req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            address:req.body.address,
            password:req.body.password
        }
        const database = req.app.locals.db
        const result =await database.collection('users').insertOne(adminAddUsers)

        res.redirect('/admin/profile')
    }
    catch(err){
        throw err
    }
})
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
        res.redirect('/admin/profile')
    }
    catch(err){
        throw err
    }
})

module.exports = router;
