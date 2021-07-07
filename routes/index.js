if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

var express = require('express');
var router = express.Router();
var dotenv = require('dotenv'); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
var assert = require('assert')
const bodyParser = require('body-parser');
const multer = require('multer')

//User Model
const User = require ('../models/User')
require('./passport-config')(passport);

//Import the module
dotenv.config();

//Set up default connection
var mongoDB = process.env.MONGODB_URI
//Connect to MongoDB
mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=>console.log('Connected to MongoDB'))
  .catch(err=>console.log(err));


router.use(express.urlencoded({extended: false}))
router.use(flash())
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true

}))
//Using Passport for Registration
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))


/* GET home page. */
router.get('/',  function(req, res, next) {
  res.render('index', { title: 'MediaKeeper' });
});

/* GET Login page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET Registration page. */
router.get('/register', function(req, res, next) {
  res.render('register');
});



/* GET UserProfile page. */
router.get('/userprofile', checkAuthenticated,function(req, res) {
  res.render('userprofile', { username: req.user.username});

});


//Register handle Y
router.post('/register', (req,res)=>{
  const {username,email,password}=req.body;
  let errors=[];

  //check required fields
  if(!username || !email || !password){
      errors.push({msg:'Please fill in all fields'});
  }


  //check pass length
  if(password.length<6){
      errors.push({msg:'Password should be at least 6 characters'});
  }

  if(errors.length>0){
      res.render('register',{
          errors,
          username,
          email,
          password
      });
  }else{
      // validation passed
      User.findOne({email:email})
      .then(user =>{
          if(user){
              //user exists
              errors.push({msg:'Email is already registered'})
              res.render('register',{
                  errors,
                  username,
                  email,
                  password
              });
          }else{
              const newUser= new User({
                  username,
                  email,
                  password
              });
          //hash password
          bcrypt.genSalt(10,(err,salt)=>
              bcrypt.hash(newUser.password,salt,(err,hash)=>{
                  if(err)throw err;
                  //set password to hashed
                  newUser.password=hash;
                  //save user
                  newUser.save()
                      .then(user=>{
                          req.flash('success_msg','You are now registered and can log in');
                          res.redirect('/login');
                      })
                      .catch(err=>console.log(err));
          }));
              
          }
      }
      );
  }
}
);

// login handle Y
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
      successRedirect: '/userprofile',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
});


//logout handle Y
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','You are logged out');
  res.redirect('/login');
});

function checkAuthenticated(req, res, next){
  if (req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
  if (req.isAuthenticated()){
   return res.redirect('/userprofile')
  }
  
}

module.exports = router;