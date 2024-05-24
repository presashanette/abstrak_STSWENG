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

router.post('/api/collections/add', (req, res) => {
    
})

module.exports = router;