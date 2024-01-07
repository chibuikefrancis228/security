const {Router} = require('express');
const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const {ensureAuthenticated} = require('../Config/auth');

let router = Router();

router.get('/register', (req, res)=>{
    res.render('reg')
});

router.get('/login', (req, res)=>{
    res.render('login')
});

router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render('report/dashboard', {url: req.url, title: "Dashboard"})
})

//User Registration
let errors = [];
router.post('/register', (req, res)=>{
    
    let {Firstname, Lastname, username, email, password, password1, phone} = req.body;

    //Defining Errors
    if(Firstname == "" || Lastname =="" || username=="" || email=="" || password=="" || password1=="" || phone==""){
        errors.push({msg: "Leave No Field Empty!!!"})
    }
    else if(password !== password1){
        errors.push({msg: "Password Mismatch!!!"})
    }
    else if(password.length < 6){
        errors.push({msg: "Password Must not be less than 6 characters"})
    }

    if(errors.length > 0){
        res.render('reg', {
            errors,
            Firstname,
            Lastname,
            username,
            email,
            password,
            password1,
            phone
        });
        console.log(errors)
    }else{
        //User Validation
        User.findOne({email: email})
        .then((user)=>{
            if(user){
                errors.push({msg: "Account Already Exist"})
                res.render('reg', {
                    errors,
                    Firstname,
                    Lastname,
                    username,
                    email,
                    password,
                    password1,
                    phone              
                })
            }else{
                const newUser = new User(req.body)
                //Hash Password
                bcrypt.genSalt(10, (err, salt)=> bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    //Set password to hashed
                    newUser.password = hash;
                    //Save User
                    newUser.save()
                        .then(user => {
                            req.flash("success_msg", "You are now Registered")
                            res.redirect('/user/login')
                        })
                        .catch(err => console.log(errors));
                }));
            }
        })
        
        
    }
});

//Login Handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/report/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'You are Logged out');
    res.redirect('/user/login');
});


module.exports = router;