var express = require('express');
var router = express.Router();
var dotenv = require('dotenv'); 
const mongoClient = require('mongodb').MongoClient;

//Import the module
dotenv.config();

//Set up default connection
var mongoDB = process.env.MONGODB_URI


//multer object creation
var multer  = require('multer')
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
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MediaKeeper' });
});

/* GET SignIn page. */
router.get('/signin', function(req, res) {
  res.render('signin');
});

/* GET UserHome page. */
router.get('/userhome', function(req, res) {
  res.render('userhome');

  //Connecting to Database
  mongoClient.connect(mongoDB,function(err,client){
  const myDataBase = client.db('MediaKeeperDB');
  const myCollection = myDataBase.collection('UserDetails');

  //Get informaion from collection
  myCollection.find({}).toArray(function(error,documents){
    console.log(documents);
    client.close();
  })
})
});

/* Upload Files */
router.post('/',upload.single('imageupload'), function(req,res)
{
  res.send("File upload sucessfully.");
});

module.exports = router;
