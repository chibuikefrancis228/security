const {Router} = require("express")
const Report = require("../models/Report")
const User = require("../models/User");
const Convict = require('../models/Convict')
const multer = require('multer')
const fs = require('fs')

let router = Router();

//Setup Multer
let Storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/uploads')
    },
    filename: (req, file, cb)=>{        
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    },    
});


const filefilter = (req, file, cb)=>{
    if(file.mimetype === "image/png" || file.mimetype === 'image/jpg' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false)
    }
}


const upload = multer({storage: Storage, filefilter: filefilter})


router.get('/login', (req, res, next)=>{
    res.render('admin/adminlog')
    next()
})

router.get('/convict', (req, res, next)=>{
    Convict.find().sort({createdAt: 'desc'})
    .then(convicts =>{
        res.render('admin/convict', {convicts})
    })
    .catch(error =>{
        console.error(`Error:: ${error}`)
        res.status(404).send('404, Page not Found')
    })
    
})

router.post('/', (req, res, next)=>{
    let {username, password} = req.body;

    if(username == "admin123" && password=="123456"){
        req.flash("success_msg", "Admin Logged Successfully!!!")
        res.redirect('/admin/dashboard')
    }else{
        req.flash('error_msg', 'Invalid Credentials!!!')
        res.redirect('/admin/login')
    }

    next()
})

router.get("/dashboard", async (req, res, next)=>{
    
    try{
        const users = await User.find()
        const reports = await Report.find()
        const resolved = await Report.find({resolved: true})
        //console.log("All Users:: "+users)
        res.render("admin/admin_dash", {users, reports, resolved})
    }catch(err){
        console.log(`Error:: ${err}`)
        res.status(404).render('report/404')
    }
    
    next()
    
})

router.get('/users', async (req, res, next)=>{
    try{
        const users = await User.find()
        res.render("admin/users", {users})
    }catch(err){
        console.log(`Error:: ${err}`)
        res.status(404).render('report/404')
    }

    next()
})


router.get('/complains', async (req, res, next)=>{
    try{
        const reports = await Report.find()
        res.render("admin/complains", {reports})
    }catch(err){
        console.log(`Error:: ${err}`)
        res.send("404, Page Not Found!!!")
    }

    next()
})

let errors = [];
router.post('/createConvict', upload.single('image'), (req, res, next)=>{
    let {firstname, lastname, dob, soo, address, contact, crime, lives, sentence} = req.body;
    if(firstname=='' || lastname=='' || dob=='' || soo=='' || address=='' || contact=='' || crime=='' || lives=='' || sentence ==''){
        errors.push({msg: 'Field Cannot be Empty'})
    }

    if(contact.length < 11){
        errors.push({msg: 'Contact Must not be less than 11 numbers'})        
    }


    if(errors.length > 0){
        res.render('admin/convict', {firstname, lastname, dob, soo, address, contact, errors, crime, lives, sentence})
    }else{
        const profile_pix = req.file.filename;
        const convict = new Convict({
            firstname, lastname, dob, soo, address, contact, crime, lives, sentence, profile_pix
        })
        convict.save()
        .then((result)=>{
            req.flash('success_msg', 'Ex-convict Details Added Successfully!!')
            res.redirect('/admin/convict')
        })
        .catch((error)=>{
            console.error(`Error:: ${error}`)
            res.status(404).send('404, Page not Found')
        })
    }
})


/* Update Convict Details */
router.post('/editConvict/:id', (req, res, next)=>{
    const id = req.params.id;
    Convict.findByIdAndUpdate({_id: id})
    .then(convict =>{
        fs.mv('./public/uploads/' + convict.profile_pix, (err)=>{
            if(err) throw err
        })
        convict.firstname = req.body.firstname;
        convict.lastname = req.body.lastname;
        convict.dob = req.body.dob;
        convict.soo = req.body.soo;
        convict.address = req.body.address;
        convict.contact = req.body.contact;
        convict.crime = req.body.crime;
        convict.lives = req.body.lives;
        convict.sentence = req.body.sentence;
        convict.profile_pix = req.file.filename

        convict.save()
        .then(result =>{
            req.flash('success_msg', 'Ex-convict Details updated Successfully')
            res.redirect('/admin/convict')
        })
        .catch(error =>{
            console.error(`Error:: ${error}`)
            res.status(404).send('404, Page not Found')  
        })
    })
})

router.put('/resolve/:id', async (req, res, next)=>{
    try{
        const report = await Report.findOneAndUpdate({_id: req.params.id, resolved: true})
        req.flash("success_msg", "Report Resolved Successfully!!!")
        res.redirect('/admin/complains')
    }catch(err){
        console.log(`Error:: ${err}`)
        res.render('report/404')
    }

    next()
})

router.put('/:id',  async (req, res, next)=>{
      
    try{
        const report = await Report.findOneAndUpdate({
            _id: req.params.id,
            location: req.body.location,
            description: req.body.description
        })
        req.flash("success_msg", "Report Resolved Successfully!!!");
        res.redirect('/admin/complains');
    }catch(err){
        console.log(`Error:: ${err}`)
        res.render('report/404')
    }

    next()
})



router.delete('/:id', async (req, res, next)=>{
    try{
        await Report.findByIdAndDelete(req.params.id)
        req.flash('success_msg', "Report Deleted Successfully!!!")
        res.redirect('/admin/complains')
    }catch(err){
        res.status(404).render('report/404')
    }
})

router.delete('/delUser/:id', async (req, res, next)=>{
    const id = req.params.id;
    try{
        await User.remove({_id: id});
        req.flash('success_msg', 'User Terminated Successfully!!!');
        res.redirect('/admin/users');
    }catch(err){
        console.log(`Error:: ${err}`)
        res.render('report/404')
    }

    next()
})


/* Delete Convict Details */
router.delete('/deleteConvict/:id', (req, res, next)=>{
    const id = req.params.id;
    Convict.findByIdAndDelete({_id: id})
    .then(result =>{
        fs.unlink('./public/uploads/' + result.profile_pix, (err)=>{
            if(err) throw err
        })        
        req.flash('success_msg', 'Ex-convict Details Deleted Successfully')
        res.redirect('/admin/convict')
    })
    .catch(error =>{
        console.error(`Error:: ${error}`)
        res.status(404).send('404, Page not Found')
    })
})

module.exports = router;