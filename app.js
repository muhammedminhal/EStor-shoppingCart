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

mongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error(`error in db connection ${err}`)
  } else {
    console.log("mongod connected...")
    const database = client.db("eStore")
    app.locals.db = database;



    // socket connction
    io.on('connection', (socket) => {
      console.log('a user connected')

      socket.on("join-room", body => {
        socket.join(body)
        console.log("a user joined on room via join room event: ", body)
      })
      socket.on('userRoom', (useremail) => {
        socket.join(useremail)
        console.log('buyer has created a room:', useremail)
      })
      socket.on('message', (msg) => {
        var database = app.locals.db
        database.collection('message').insertOne({
          message: msg,
        }, () => {
          socket.broadcast.emit('message', msg)
        })
      })

      socket.on('disconnect', () => {
        console.log('user left connection')
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