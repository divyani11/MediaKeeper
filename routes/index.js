if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

var express = require('express');
var router = express.Router();
var dotenv = require('dotenv'); 
//const mongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
var assert = require('assert')

//User Model
const User = require ('../models/User')
require('./passport-config')(passport);
// const initializePassport = require('./passport-config')
// initializePassport(
//   passport, 
//   email => users.find( user => user.email === email),
//   id => users.find( user => user.id === id)
// )

// const users = []

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

  // resave: false,
  // saveUninitialized: false
}))
//Using Passport for Registration
router.use(passport.initialize())
router.use(passport.session())
router.use(methodOverride('_method'))

//multer object creation
var multer  = require('multer');
var upload = multer({ storage: storage })
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

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
router.get('/userprofile', function(req, res, next) {
  res.render('userprofile');
});

// /* POST Login page. */
// router.post('/login', passport.authenticate('local', {
//   successRedirect: '/userhome',
//   failureRedirect: '/login',
//   failureFlash: true
// }))

/* GET UserHome page. */
router.get('/userhome', checkAuthenticated,function(req, res) {
  res.render('userhome', { username: req.user.username});

  //Connecting to Database
//   mongoClient.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology: true},function(err,client){
//   const myDataBase = client.db('MediaKeeperDB');
//   const myCollection = myDataBase.collection('UserDetails');

//   //Get informaion from collection
//   myCollection.find({}).toArray(function(error,documents){
//     console.log(documents);
//     client.close();
//   })
// })
});

//POST Registration
// router.post('/register', async (req,res) => {

//   try {
//       const hashedPassword = await bcrypt.hash(req.body.password,10)
      // users.push({
      //   id: Date.now().toString(),
      //   username: req.body.username,
      //   email: req.body.email,
      //   password: hashedPassword
      // })
      
      // res.redirect('/login')

      // var item = {
      //   id: Date.now().toString(),
      //   username: req.body.username,
      //   email: req.body.email,
      //   password: hashedPassword
      // }
      // mongoClient.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology: true},function(err,client){
      //   const myDataBase = client.db('MediaKeeperDB');
      //   console.log('step 1')
      //   const myCollection = myDataBase.collection('UserDetails');
      //   console.log('step 2')
      //   myCollection.insertOne(item,function(err, result){
      //     console.log(result);
      //     assert.strictEqual(null, err);
      //     console.log('Item Inserted')
          
      //     client.close();
      //   })
      //   console.log('step 3')
      // mongoClient.connect(mongoDB,function(err, client){
      //   assert.equal(null, err);
      //   client.db.collection('UserDetails').insertOne(item,function(err, result){
      //     assert.equal(null, error);
      //     console.log('Item Inserted')
      //     db.close();
      //   })
//       })
//       res.redirect('/login')
//   } catch{
//     alert("Opps! Something went wrong.");
//     res.redirect('/register')
//   }
//   console.log(users)
// })

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
      successRedirect: '/userhome',
      failureRedirect: '/login',
      failureFlash: true
    })(req, res, next);
});

// router.delete('/logout',(req,res)=>{
//   req.logout()
//   res.redirect('/login')
// })

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
   return res.redirect('/userhome')
  }
  
}

/* Upload Files */
router.post('/',upload.single('imageupload'), function(req,res)
{
  res.send("File upload sucessfully.");
});

module.exports = router;
