var express = require('express');
var router = express.Router();
var dotenv = require('dotenv'); 
const mongoClient = require('mongodb').MongoClient;

//Import the module
dotenv.config();

//Set up default connection
var mongoDB = process.env.MONGODB_URI

//Connecting to Database
mongoClient.connect(mongoDB,function(err,client){
  console.log('Connected with DB')
})

//multer object creation
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})
 
var upload = multer({ storage: storage })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MediaKeeper' });
});

router.get('/signin', function(req, res) {
  res.render('signin');
});

router.get('/userhome', function(req, res) {
  res.render('userhome');
});

/* Upload Files */
router.post('/',upload.single('imageupload'), function(req,res)
{
  res.send("File upload sucessfully.");
});

module.exports = router;
