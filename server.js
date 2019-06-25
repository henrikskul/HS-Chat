const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const Chat = require('./models/chat');

let users = [];
let connections = [];
let chat = [];

const PORT = process.env.PORT || 5000;

// server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = process.env.MOBGODB_URI; //|| require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// sockets.io
io.sockets.on('connection', socket => { 
  //if (socket.username) users.splice(users.indexOf(socket.username), 1);
  console.log("user connected");
  connections.push(socket);
  updateUsernames();
  updateChat();
  console.log('Connected: %s sockets connected', connections.length);
  

  // Send Message
  socket.on('send message', data => {
    const newChat = new Chat({
      user: socket.username,
      message: data
    });
    newChat
    .save()
    .then(e => {
      chat.push(e);
      updateChat();
      //io.sockets.emit('new chat', chat);
    })
    .catch(err => console.log(err));
  });

  // New User
  socket.on('new user', user => {
    socket.username = user;
    users.push(socket.username);
    console.log(users);
    updateUsernames();
  });

  function updateChat(){
    Chat.find().then(c => {
      chat = c
      io.sockets.emit('new chat', chat);
    }).catch(err => console.log(err));
  }

  function updateUsernames(){
    io.sockets.emit('get users', users);
  }

  socket.on('disconnect', function(){
    connections.splice(connections.indexOf(socket), 1);
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    console.log('user disconnected');
    console.log('Connected: %s sockets connected', connections.length);
  });
});