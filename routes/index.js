var express = require('express');
var router = express.Router();
var dotenv = require('dotenv'); 

//Import the module
dotenv.config();

//Set up default connection
var mongoDB = process.env.MONGODB_URI


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
