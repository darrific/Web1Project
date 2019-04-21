var express = require('express');
var router = express.Router();
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const nasaToken = 'EO5rCgY1q2pVCQGc05BXGblar5EI60RuCLoFR5Dq';


/* GET home page. */
router.get('/', function(req, res, next) {

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let coverImgUrl = JSON.parse(this.responseText);
      res.render('index', { title: 'Simple NASA App', image: coverImgUrl.url, imgDate: coverImgUrl.date, imgExplaination: coverImgUrl.explanation});
    }
  };
  xhttp.open("GET", "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY", true);
  xhttp.send();
});




module.exports = router;
