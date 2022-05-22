const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const path = require('path');

const Model = require('./model');
//****End of imports****

const connection = () => {
    mongoose.connect('mongodb://localhost/JournalOn', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('Connected With Mongo DB');
};
connection();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', (req, res) => {
    sessionNow=req.session;
    if(sessionNow.userid){
        Model.findOne({_id: sessionNow.userid}).then(data => {
            let xyz = {
                name : data.name,
                email : data.email,
                _id : data._id,
                journal: data.journal
            }
            res.render('dashboard', {dataSet : xyz});
        }).catch(err => {
            res.send(err);
        })
    }else{
        res.render('home');
    }
});

app.get('/calender', (req, res) => {
    res.render('calender');
})

app.get('/login', (req, res) => {
    res.render('credCheck', {type : true});
});
app.get('/sign-up', (req, res) => {
    res.render('credCheck', {type : false});
});
app.post('/login', (req, res) => {
    Model.find({email : req.body.email, password: req.body.password}).then(data => {
        sessionNow=req.session;
        sessionNow.userid=data[0]._id;
        res.redirect('/');
    }).catch(err => {
        res.send(err);
    })
});
app.post('/sign-up', (req, res) => {
    const addData = new Model({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password
    }).save().catch(err => {
        res.send(err);
    }).then(data => {
        sessionNow=req.session;
        sessionNow.userid=data._id;
        res.redirect(`/`);
    })
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');  
})


app.get('/make', (req, res) => {
    sessionNow=req.session;
    if(sessionNow.userid){
        res.render('createJournal');
    }else{
        res.redirect('/')
    }
})
app.post('/make', async (req, res) => {
    sessionNow=req.session;
    if(sessionNow.userid){
        await Model.findOneAndUpdate({_id: sessionNow.userid}, { $push: { journal : {title: req.body.title, description: req.body.description, color: req.body.color}}}, { new: true }).then(data => {
            res.redirect('/');
        }).catch(err => {
            res.send(err);
        })
    }else{
        res.render('home');
    }
})

app.get('/write/:nameNote', (req, res) => {
    sessionNow=req.session;
    if(sessionNow.userid){
        Model.findOne({_id: sessionNow.userid}).then(data => {
            let xyz = {};
            data.journal.forEach(element => {
                if(element.id = req.params.nameNote){
                    xyz = element
                }
            });
            res.render('edit', {dataSet : xyz});
        }).catch(err => {
            res.send(err);
        })
    }else{
        res.redirect('/');
    }
});
app.post('/write/:nameNote', async(req, res) => {
    sessionNow=req.session;
    if(sessionNow.userid){
        xyz = []
        await Model.findOne({_id: sessionNow.userid}).then(async data => {
            data.journal.forEach(function (element){
                if(element.id == req.params.nameNote){
                    element.title = req.body.title;
                    element.description = req.body.description;
                    element.color = req.body.color;
                    element.text = req.body.text;
                    xyz.push(element)
                }else{
                    xyz.push(element)
                }
            })
            await Model.findOneAndUpdate({_id: sessionNow.userid}, { journal : xyz}, { new: true }).then(data => {
                res.redirect('/');
            }).catch(err => {
                res.send(err);
            })
        }).catch(err => {
            res.send(err);
        })
    }else{
        res.render('home');
    }
});

//********* listening to port ********
app.listen(3000);