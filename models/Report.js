const mongoose = require('mongoose');
const slugify = require('slugify');


let reportSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    crime_condition: {
        type: String,
        required: true
    },
    crime_type: {
        type: String,
        required: true
    },
    resolved: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});


reportSchema.pre('validate', function(next){
    let reportID = `${this.location}_${this.createdAt}`
    if(this.location){
        this.slug = slugify(reportID, {lower: true, strict: true})
    }

    next()
})

module.exports = mongoose.model('Report', reportSchema);