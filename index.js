var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next) {
    res.render('index', {tittle: 'Astro Telecable'});
});

module.exports = router;
const port = process.env.PORT || 3000
