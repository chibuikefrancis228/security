const {Router} = require('express');
const {ensureAuthenticated} = require('../Config/auth');
const Report = require("../models/Report")
const User = require("../models/User")

let router = Router();

router.get('/dashboard', ensureAuthenticated, async (req, res)=>{
    try{
        const reports = await Report.find({user: req.user.id}).lean()
        const report_attended = await Report.find({user: req.user.id, resolved: true}).lean()
        const users = await User.find().lean()
        res.render('report/dashboard', {user: req.user.username, users, reports, report_attended})
    }catch(e){
        res.status(404).render('report/404')
    }
  
})

router.get('/report', ensureAuthenticated, (req, res)=>{
    res.render('report/report', {user: req.user.username})
});

router.get('/editUser', ensureAuthenticated, (req, res)=>{
    res.render('report/editUser', {user: req.user.username, profile: req.user})
});

//Edit User Profile
router.put('/user/:id', ensureAuthenticated, (req, res)=>{
    User.findByIdAndUpdate(req.params.id, req.body)
    .then((users)=>{
        req.flash("success_msg", "User Profile Updated Successfully!!!")
        res.redirect('/report/dashboard')
    })
    .catch((err)=>{
        console.log(`Error:: ${err}`)
        res.render('report/404')
    })
})

//Report Post Request
let errors = [];
router.post('/', ensureAuthenticated, async (req, res, next)=>{
    let {location, description, crime_condition, crime_type} = req.body;

    if(location=="" || description =="" || crime_condition =="" || crime_type ==""){
        errors.push({msg: "Please Fill up the Empty Field"})
    }
    if(location.length < 12 || description.length < 12){
        errors.push({msg: "Text must not be Less than 12 characters!!!"})
    }


    if(errors.length > 0){
        res.render('report/report', {
            errors,
            location,
            description,
            crime_type,
            crime_condition,
            user: req.user.name
        });
    }else{        

        try{
            req.body.user = req.user.id
            await Report.create(req.body)
            req.flash("success_msg", "Complain Sent Successfully!!!")
            res.redirect("/report/dashboard")
        }catch(e){
            console.error(`Error:: ${e}`)
            res.status(404).render('report/404')
        }
    }

    next();
})

router.put('/edit/:id', ensureAuthenticated, async (req, res, next)=>{

    try{
        await Report.findByIdAndUpdate(req.params.id, req.body)
        req.flash("success_msg", "Report Updated Successfully!!!");
        res.redirect('/report/dashboard');
    }catch(err){
        console.log(`Error:: ${err}`);
        res.status(404).render('report/404')
    }

    next()
})


router.delete('/:id', ensureAuthenticated, async (req, res, next)=> {
    try{
        await Report.findByIdAndDelete(req.params.id)
        req.flash("success_msg", "Report Deleted Successfully!!!")
        res.redirect('/report/dashboard')
    }catch(err){
        console.log(`Error:: ${err}`)
        res.status(404).render('report/404')
    }

    next();
})



module.exports = router;