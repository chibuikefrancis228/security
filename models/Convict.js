const mongoose = require('mongoose');

const convictSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    dob:{
        type: String,
        required: true
    },
    soo:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    contact:{
        type: String,
        required: true
    },
    crime:{
        type: String,
        required: true
    },
    lives:{
        type: String,
        required: true
    },
    sentence:{
        type: String,
        required: true
    },
    profile_pix:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
});


module.exports = mongoose.model('Convict', convictSchema)