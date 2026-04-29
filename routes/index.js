const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Simple landing page - no data fetching needed
  res.render('index', { 
    title: 'Photo Gallery Home'
  });
});

module.exports = router;
