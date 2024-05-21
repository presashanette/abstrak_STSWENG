const express = require('express');
const path = require('path');

const router = express.Router();



router.get('/', (req, res) => {
    res.render("collections");
});


router.get('/collections', (req, res) => {
    res.render("collections");
})

router.get('/addcollection', (req, res) => {  
    res.render("addcollection");
});

module.exports = router;