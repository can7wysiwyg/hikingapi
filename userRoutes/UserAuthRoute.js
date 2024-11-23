const UserAuth = require('express').Router();
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verify");

UserAuth.post("/user_register", asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname) return res.json({ msg: "Your name cannot be empty" });
    if (!email) return res.json({ msg: "Your email cannot be empty" });
    if (!password) return res.json({ msg: "Password cannot be empty" });

    
   

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.json({ msg: "The email exists, please use another" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

   
    const user = new User({
      fullname,
     
      email,
      password: hashedPassword,
    });

    await user.save();

    
    res.json({ msg: "Your account has been successfully created!" });
  } catch (error) {
    console.error(`Error during registration: ${error}`);
    res.json({ msg: `There was an error: ${error.message}` });
  }
}));


UserAuth.post("/user_login", asyncHandler(async(req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email }).select("+password");
  

  if (!userExists) {
    res.json({
      msg: "No user associated with this email exists in our system. Please register.",
    });
  }

  const passwordMatch = await bcrypt.compare(password, userExists.password);

  if (passwordMatch) {
    
    let refreshtoken = createRefreshToken({id: userExists._id})

    res.cookie('refreshtoken', refreshtoken, { expire: new Date() + 9999 });

    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN, (err, user) =>{
      if(err) return res.status(400).json({msg: "Please Login or Register"})
  
      const accesstoken = createAccessToken({id: user.id})
      
  
      res.json({accesstoken}) })


    
  } else {
    res.json({ msg: "check your password again" });
  } 


  
}))



UserAuth.get('/auth/user',verify, asyncHandler(async(req, res) => {
  try{
    const user = await User.findById(req.user).select('-password')
    if(!user) return res.json({msg: "User does not exist."})
  
    res.json({user})
  
  
  }
    catch(err) {
      return res.json({msg: err.message})
  
  
    }
  
  
  }))




const createAccessToken = (user) =>{
  return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
}
const createRefreshToken = (user) =>{
  return jwt.sign(user, process.env.REFRESH_TOKEN, {expiresIn: '7d'})
}



module.exports = UserAuth;
