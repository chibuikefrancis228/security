const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require("method-override")


let app = express();

//Passport config
require('./Config/passport')(passport);


//Database Connection
mongoose.connect('mongodb://localhost/security', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(result => console.log("Database Connected!!!"))
    .catch(err => console.error(`Database Error: ${err}`))


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'))
app.use(methodOverride("_method"))
//Express Session
app.use(session({
    secret: "283y73hwf",
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


//Connect Flash
app.use(flash())
//Global Variable
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
});

//Index Route
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

//User Route
const userRouter = require('./routes/user');
app.use('/user', userRouter);

//Report Route
const reportRouter = require('./routes/report');
app.use('/report', reportRouter);

//Admin Route
const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter);

//404 Error Middleware
/* app.use((req, res, next)=>{
    res.render('report/404')
    next()
}) */

let PORT = process.env.PORT | 8086
app.listen(PORT, ()=>{
    console.log(`Running On Port: ${PORT}`);
})