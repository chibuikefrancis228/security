const {Router} = require('express');


let router = Router();

router.get('/', (req, res)=>{
    res.render('index', {isUser: req.isAuthenticated(), user: req.user})
    console.log(req.isAuthenticated())
});


module.exports = router;