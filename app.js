
var mongoose = require('mongoose'),
    DB_URL = 'mongodb://localhost/logintest',
    express = require('express'),
    app = new express(),
    User = require('./models/user'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session)

mongoose.set('debug', true)

mongoose.connect(DB_URL, {
    useMongoClient: true
})

mongoose.connection.on('connected', function(){
    console.log('数据库成功连接: ' + DB_URL)
})

mongoose.connection.on('error', function (err) {
    console.log('数据库成功连接失败: ' + err);
})

mongoose.connection.on('disconnected', function () {
    console.log('数据库已断开');
})

app.set('views', './views')
app.set('view engine', 'pug')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    secret: 'imooc',
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
        url: DB_URL,
        collection: 'sessions'
    })
}))

app.use((req, res, next) => {
    var _user = req.session.user
    app.locals.user = _user
    next()
}

app.get('/', function(req, res){
    res.render('logup')
})

app.get('/login', function (req, res) {
    res.render('login')
})

app.get('/index', function (req, res) {
    console.log('session在user ：')
    console.log(req.session.user)

    var _user = req.session.user
    app.locals.user = _user

    res.render('index')
})

app.post('/user/singup', function(req,res){
    var _user = req.body.user

    console.log(_user)

    User.findOne({name : _user.name}, function(err, user){
        if (err) {
            console.log(err)
        }

        if(user){
            return res.redirect('/')
        }else{
            var user = new User(_user)
            user.save(function (err, user) {
                if (err) {
                    console.log(err)
                }

                console.log(user)
                res.redirect('/userlist')
            })
        }
    })
})

app.post('/user/singin', function(req, res){
    var _user = req.body.user
    var name  = _user.name
    var password = _user.password

    User.findOne({name : name}, function(err, user){
        if (err) {
            console.log(err)
        }

        if (!user){
            return res.redirect('/')
        }

        user.comparePassword(password, function(err, isMatch) {
            if (err) {
                console.log(err)
            }
            
            if (isMatch){
                console.log('成功登录')
                req.session.user = user
                return res.redirect('/index')
            }else{
                console.log('失败登录')
                return res.redirect('/')
            }
        })
    })
})

app.get('/logout', function(req, res){
    delete req.session.user 
    delete app.locals.user

    res.redirect('/login')
})

app.get('/userlist', function(req, res){
    User.fetch(function(err, users){
        if (err) {
            console.log(err)
        }

        res.render('userlist', {
            users : users
        })
    })
})
app.locals.moment = require('moment')
app.listen(8080)
console.log('success')

