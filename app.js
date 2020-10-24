var express = require('express');
var app = express();
var http = require('http').createServer(app)
var io = require('socket.io')(http)

var path = require('path');
var cookieParser = require('cookie-parser');
var mongoClient = require("mongodb").MongoClient
var multer = require('multer')
var path = require('path')
var expressHbs = require('express-handlebars')
var session = require("express-session")
var passport = require('passport')
var flash = require('connect-flash')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const { body } = require('express-validator');
const { users } = require('./contollers/admin');
var binjo = {}


mongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error(`error in db connection ${err}`)
  } else {
    console.log("mongod connected...")
    const database = client.db("eStore")
    app.locals.db = database;





    io.on("connection", (socket) => {

      socket.on('new user',(data)=>{
       
        socket.name =data;
        binjo[socket.name] = socket;
      })
    
      socket.on('chatIntraction',function(data){
       var  user ={
           uemail :data.uEmail,
           semail :data.sEmail
        }
      
        database.collection('notification').insertOne(user)
      })
    
      if(socket.handshake.query.email_address){
        //create a room
        const email_address = socket.handshake.query.email_address;
        socket.join(email_address);
        console.log(email_address, "created a room and joined in it");
      }
    
      if(socket.handshake.query.target){
        const target = socket.handshake.query.target;
        socket.join(target);
        console.log("a user joined the room", target);
        //pull message from db
        //loop emit to room as "message"
        
      }
    
      socket.on("message", (body) => {
        const { message, target, origin } = body;
        console.log(message);
        console.log(target)
        console.log("origin: ", origin)
        io.to(target).emit("message", body);
      })
    
    })
    
  }
})










app.engine('hbs', expressHbs({ defaultLayout: 'layout', extname: 'hbs' }));

app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: "users",
  secret: 'uppupantte mundiringa',
  resave: false,
  saveUninitialized: true,
  cookie:
    { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash())


app.use(passport.initialize())
app.use(passport.session())


require('./config/passport')

// sesion all over
app.use((req, res, next) => {
  res.locals.session = req.session
  next();
});


// imgae upload

app.use(express.static(__dirname + "./public/"));


// routers midleware
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter)




const port = 3000;

http.listen(port, (err, connect) => {
  if (!err) {
    console.log(`connected in port:${port}`)
  }
})