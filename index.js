// imports
require('dotenv').config(); 
// dotenv để sử dụng process.env -> lấy ra các biến trong .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000; 

// database connection
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to the database'));

// config req.body
// milddlewares: hỗ trợ lấy input từ html gửi lên server
app.use(express.urlencoded({extended: false})); // for form data, 
app.use(express.json()); // convert kiểu dữ liệu sang json

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// tất cả file trong 'uploads' là file động
app.use(express.static('uploads')); // hien thi anh

// set template engine
// view engine cho phép tạo và hiển thị các trang html động
//EJS (Embedded JavaScript) là 1 view engine cho phép nhúng mã js vào html
app.set('view engine', 'ejs'); // dùng ejs làm view engine cho ứng dụng

// route prefix
app.use("", require('./routes/routes')); // gọi đến routes

app.get('/',(req, res) => {
    res.send('Hello World');
});

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});