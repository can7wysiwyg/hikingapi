const AdminAuthRoute = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler')
const MainAdmin = require('../models/MainAdmin')
const verifyMainAdmin = require('../adminmiddleware/verifyMainAdmin')


AdminAuthRoute.post('/admin_register', asyncHandler(async(req, res, next) => {

    try {
        const {fullname, email, password} = req.body

        if(!fullname) res.json({msg: "fullname cannot be empty.."})

        if(!email) res.json({msg: "email cannot be empty..."})

        if(!password) res.json({msg: "password cannot be empty.."})


        const emailExists = await  MainAdmin.findOne({ email });

    if (emailExists) {
      res.json({ msg: "The email exists, please user another one or login" });
    }

    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
    
      
      
        await MainAdmin.create({
          fullname,
          email,
          password: hashedPassword
        });
    
        res.json({ msg: "Admin account created successfully created!" });
    
    } catch (error) {
        next(error)
    }

  }))





  AdminAuthRoute.post("/admin_login", asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    const userExists = await MainAdmin.findOne({ email }).select("+password");
    

    if (!userExists) {
      res.json({
        msg: "this email is not associated with any admin.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userExists.password);

    if (passwordMatch) {
      
      let refreshtoken = createRefreshToken({id: userExists._id})

      res.cookie('refreshtoken', refreshtoken, { expire: new Date() + 9999 });

      jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_MAIN_ADMIN, (err, mainadmin) =>{
        if(err) return res.status(400).json({msg: "Email the admin for help.."})
    
        const supertoken = createAccessToken({id: mainadmin.id})
        
    
        res.json({supertoken}) })


      
    } else {
      res.json({ msg: "check your password again" });
    } 


    
}))




AdminAuthRoute.get('/admin_admin', verifyMainAdmin, asyncHandler(async(req, res) => {
    try{
      const mainadmin = await MainAdmin.findById(req.super).select('-password')
      if(!mainadmin) return res.status(400).json({msg: "this admin does not exist d does not exist."})
    
      res.json({mainadmin})
    
    
    
    
    }
      catch(err) {
        return res.status(500).json({msg: err.message})
    
    
      }
    
    
    }))
  
  
  
const createAccessToken = (admin) =>{
        return jwt.sign(admin, process.env.ACCESS_TOKEN_MAIN_ADMIN, {expiresIn: '14d'})
      }


const createRefreshToken = (admin) =>{
        return jwt.sign(admin, process.env.REFRESH_TOKEN_MAIN_ADMIN, {expiresIn: '14d'})
      }
    
  



module.exports = AdminAuthRoute