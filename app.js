var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
const APITokens = require('./routes/twitterModule');
var User = require('./models/users')
var mongoose = require('mongoose');
let dbToken = 'mongodb://darrific:securepassword123@ds153380.mlab.com:53380/web1project';
var opts = {
     server: {
        socketOptions: {keepAlive: 1}
     }
};

mongoose.connect(dbToken, { useNewUrlParser: true }, opts);
let db = mongoose.connection;

// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        console.log("1")
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
     	if(isMatch){
        console.log("2") 
     	  return done(null, user);
     	} else {
        console.log("3")
     	  return done(null, false, {message: 'Invalid password'});
     	}
     });
   });
  }
));

passport.use(new TwitterStrategy({
  consumerKey: APITokens.consumer_key,
  consumerSecret: APITokens.consumer_secret,
  callbackURL: "http://web1.varion.co/twitterconnectcb"
},
function(token, tokenSecret, profile, done) {
  User.getUserByUsername(profile.displayName, function(err, user) {
    if (err) { return done(err); }
    if(user && user.twitterToken=="-1"){
      user.twitterToken = token;
    }
    done(null, user);
  });
}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
