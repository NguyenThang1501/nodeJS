const express = require('express');
const router = express.Router(); 
const User = require('../models/users');
const multer = require('multer'); // Dùng để upload file lên
const fs = require('fs'); // file system: xử lý file
const { error } = require('console');

// image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image'); // each time, only upload 1 image

//Insert an user into database route (Create)
//post: dùng tạo mới dữ liệu trên máy chủ
router.post('/add', upload, async (req, res) => { // yêu cầu POST tới đường dẫn /add
    const user = new User({ // Tạo 1 đối tượng User mới dựa trên mô hình User 
        email: req.body.email, //với các thuộc tính được lấy từ req.body (gửi từ file html)
        name: req.body.name,
        phone: req.body.phone,
        image: req.file.filename, //lấy dữ liệu từ tệp đc tải lên
    });
    user.save() // gọi phương thức save() (Trong mongose,phương thức có sẵn trong document) để lưu vào cơ sở dữ liệu
    .then(() => {
        req.session.message = { // Thiết lập 1 thông báo kiểu 'success' trong session của người dùng
            type: 'success',
            message: 'User added successfully!'
        }
        res.redirect("/"); //Trả về đường dẫn gốc (home)
    })
    .catch(err => { // bắt lỗi
        res.json({message: err.message, type: 'danger'});
    });
});

//get all users route (Read)
// get thường đc dùng truy vấn dữ liệu từ máy chủ
router.get('/', async (req,res) =>{
    User.find().exec()
    .then( users => {
        res.render("index", {
            title: "Home Page",
            users: users,
        })
    })
    .catch(err => {
        res.json({message: err.message});        
    })
});

router.get('/add',async(req, res) =>{
    res.render('add_user', { title: "Add Users"});
});

// Edit an user route (Update : edit + update)
router.get("/edit/:id", async(req, res)=> {
    let id = req.params.id;
    User.findById(id).then(user =>{ //findByID la mot ham trong mongodb    
        if (user == null){
            res.redirect("/")
        }else{
            res.render('edit_users',{
                title:'Edit user',                    
                user:  user,
            }); 
        }  
    })
    .catch(err =>{
        res.redirect('/');
    });
});

// Update user route
router.post('/update/:id', upload, async(req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch(err){
            console.log(err);
        }
    } else{
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }
        ).then(result =>{     
        req.session.message = {
            type: "success",
            message: "User updated sucessfully"
        };
        res.redirect('/');
    })
    .catch(err =>{
        res.json({message: err.message, type: "danger"});
    });
});

// delete user route (Delete)
router.get('/delete/:id', (req, res) =>{
    let id = req.params.id;
    User.findByIdAndRemove(id).then(result =>
        {
            if (result.image != ''){    
                fs.unlinkSync('./uploads/' + result.image); // huỷ liên kết đến file ảnh trong uploads
            }
            req.session.message = {
                type: "info",
                message: "User deleted successfully"
            };
            res.redirect("/");
        })
        .catch(err=>{
            console.log(err);
        });
});

module.exports = router; // để có thể export ra ở file index.js