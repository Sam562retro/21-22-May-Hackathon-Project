const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const JournalNote = mongoose.Schema({
    id: {
        type: String,
        required: true,
        default: uuidv4()
    },
    title : {
        type : String,
        required : true,
        default : "Your Note"
    },
    description : {
        type :String,
        default : "Customize your note, enter text in it and start journaling ! This is your journal and private to you. you can click to go to editor, you can change the name, description and can put your own color for the journal."
    },
    text : {
        type : String,
        default : "Enter your thoughts, feelings or anything you like here"
    },
    color : {
        type : String,
        required : true,
        default : "success"
    }
})

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    email : {
        type : String,
        required: true
    },
    password : {
        type : String,
        required: true
    },
    journal : {
        type : [JournalNote],
        default : [JournalNote]
    }
});

module.exports = mongoose.model('Users', userSchema);