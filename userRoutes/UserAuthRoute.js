const UserAuth = require('express').Router();
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verify");
const TemporaryUser = require('../models/TemporarlyUserMod')
const crypto = require('crypto');
const nodemailer = require('nodemailer')





// UserAuth.post("/user_register", asyncHandler(async (req, res) => {
//   try {
//     const { fullname, email, password, phone } = req.body;

//     if (!fullname) return res.status(400).json({ msg: "Your name cannot be empty" });
//     if (!email) return res.status(400).json({ msg: "Your email cannot be empty" });
//     if (!password) return res.status(400).json({ msg: "Password cannot be empty" });
//     if (!phone) return res.status(400).json({ msg: "Phone number cannot be empty" });

//     // Check if email already exists in permanent or temporary collections
//     const emailExists = await User.findOne({ email }) || await TemporaryUser.findOne({ email });
//     if (emailExists) {
//       return res.status(400).json({ msg: "The email exists, please use another" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate a verification code
//     const verificationCode = crypto.randomInt(100000, 999999);

//     // Save user in the TemporaryUser collection
//     const tempUser = new TemporaryUser({
//       fullname,
//       email,
//       password: hashedPassword,
//       phone,
//       verificationCode,
//     });

//     await tempUser.save();

//     const transporter = nodemailer.createTransport({
//       service: 'gmail', 
//       auth: { user: process.env.EMAIL_USER, 
//              pass: process.env.EMAIL_PASSWORD  
//       }
//   });
 

//     // Send verification code to user's email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Email Verification Code',
//       text: `Your verification code is: ${verificationCode}. It is valid for 10 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ msg: "A verification code has been sent to your email." });
//   } catch (error) {
//     console.error(`Error during registration: ${error.stack}`);
//     res.status(500).json({ msg: `There was an error: ${error.message}` });
//   }
// }));



// UserAuth.post("/verify_email", asyncHandler(async (req, res) => {
//   try {
//     const { email, verificationCode } = req.body;

//     if (!email || !verificationCode) {
//       return res.status(400).json({ msg: "Email and verification code are required." });
//     }

//     // Retrieve the user from the TemporaryUser collection
//     const tempUser = await TemporaryUser.findOne({ email });

//     if (!tempUser) {
//       return res.status(400).json({ msg: "Verification code expired or invalid." });
//     }

//     // Check if the verification code matches
//     if (tempUser.verificationCode !== parseInt(verificationCode, 10)) {
//       return res.status(400).json({ msg: "Invalid verification code." });
//     }

//     // Move the user to the User collection
//     const newUser = new User({
//       fullname: tempUser.fullname,
//       email: tempUser.email,
//       phone: tempUser.phone,
//       password: tempUser.password,
//     });

//     await newUser.save();

//     // Remove the user from the TemporaryUser collection
//     await TemporaryUser.deleteOne({ email });

//     res.status(201).json({ msg: "Email verified, account created successfully! Please Login" });
//   } catch (error) {
//     console.error(`Error during verification: ${error.stack}`);
//     res.status(500).json({ msg: `There was an error: ${error.message}` });
//   }
// }));







UserAuth.post("/user_register", asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;
    if (!fullname) return res.status(400).json({ msg: "Your name cannot be empty" });
    if (!email) return res.status(400).json({ msg: "Your email cannot be empty" });
    if (!password) return res.status(400).json({ msg: "Password cannot be empty" });
    if (!phone) return res.status(400).json({ msg: "Phone number cannot be empty" });
    
    // Check if email already exists in permanent or temporary collections
    const emailExists = await User.findOne({ email }) || await TemporaryUser.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "The email exists, please use another" });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a verification token (rather than a code)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Save user in the TemporaryUser collection
    const tempUser = new TemporaryUser({
      fullname,
      email,
      password: hashedPassword,
      phone,
      verificationToken,
      tokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutes expiration
    });
    await tempUser.save();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD  
      }
    });
    
    // Create verification URL
    // This should be your backend URL
    const verificationUrl = `${process.env.BACKEND_URL}/verify_email/${verificationToken}`;
    
    // Create deep link to your app
    const appDeepLink = `yourapp://login`;
    
    // Send verification link to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activate Your Account',
      html: `
        <h1>Welcome to YourApp!</h1>
        <p>Thank you for registering. Please click the link below to activate your account:</p>
        <a href="${verificationUrl}">Activate Account</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ msg: "An activation link has been sent to your email." });
  } catch (error) {
    console.error(`Error during registration: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));

// Email verification endpoint (handles the link click)
UserAuth.get("/verify_email/:token", asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    
    // Retrieve the user from the TemporaryUser collection
    const tempUser = await TemporaryUser.findOne({ 
      verificationToken: token,
      tokenExpires: { $gt: Date.now() } // Check if token hasn't expired
    });
    
    if (!tempUser) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Verification Failed</h1>
            <p>The verification link is invalid or has expired.</p>
          </body>
        </html>
      `);
    }
    
    // Move the user to the User collection
    const newUser = new User({
      fullname: tempUser.fullname,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });
    await newUser.save();
    
    // Remove the user from the TemporaryUser collection
    await TemporaryUser.deleteOne({ email: tempUser.email });
    
    // Get your app's deep link URL
    const appDeepLink = `passenger://Login`;
 
    // Redirect to the app with success message
    res.redirect(appDeepLink);
    
    // If deep linking doesn't work, you can show a success page instead
    // res.status(200).send(`
    //   <html>
    //     <body>
    //       <h1>Account Activated!</h1>
    //       <p>Your account has been successfully activated. You can now log in to the app.</p>
    //       <a href="${appDeepLink}">Open App</a>
    //     </body>
    //   </html>
    // `);
  } catch (error) {
    console.error(`Error during verification: ${error.stack}`);
    res.status(500).send(`
      <html>
        <body>
          <h1>Verification Error</h1>
          <p>There was an error during verification: ${error.message}</p>
        </body>
      </html>
    `);
  }
}));



UserAuth.post("/resend_verification", asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required." });
    }

    // Retrieve the user from the TemporaryUser collection
    const tempUser = await TemporaryUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ msg: "User not found or verification code expired." });
    }

    // Generate a new verification code
    const newCode = crypto.randomInt(100000, 999999);
    tempUser.verificationCode = newCode;
    tempUser.createdAt = Date.now(); // Reset expiration timer

    await tempUser.save();

    // Send the new verification code to the user's email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Resend Verification Code',
      text: `Your new verification code is: ${newCode}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "A new verification code has been sent to your email." });
  } catch (error) {
    console.error(`Error during resend: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
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

    await User.findByIdAndUpdate(userExists._id, {
      fcmToken: null,
      devicePlatform: null
  });
    
    let refreshtoken = createRefreshToken({id: userExists._id})

    res.cookie('refreshtoken', refreshtoken, { expire: new Date() + 9999 });

    jwt.verify(refreshtoken, process.env.REFRESH_TOKEN, (err, user) =>{
      if(err) return res.status(400).json({msg: "Please Login or Register"})
  
      const accesstoken = createAccessToken({id: user.id})
      
  
      res.json({accesstoken,

        isFirstTimeUser: userExists.isFirstTimeUser

      }) })


    
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




  UserAuth.post('/user_forgot_password', asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ msg: "Field cannot be empty." });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ msg: "No user with this email address exists." });
      }
  
      // Generate a verification code
      const verificationCode = crypto.randomInt(100000, 999999); // 6-digit code
      const codeExpiration = Date.now() + 3600000; // Code valid for 1 hour
  
      // Save the code and expiration to the database
      user.passwordResetCode = verificationCode;
      user.passwordResetCodeExpires = codeExpiration;
      await user.save();
  
      // Send the code via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${verificationCode}. It will expire in 1 hour.`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ msg: "Password reset code sent to your email." });
  
    } catch (error) {
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  }));



  UserAuth.post('/reset_password', asyncHandler(async (req, res) => {
    try {
      const { email, newPassword, code } = req.body;
  
      if (!email || !newPassword || !code) {
        return res.status(400).json({ msg: "Fields cannot be empty." });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ msg: "No user with this email address exists." });
      }
  
      // Check if the code matches and is not expired
      if (user.passwordResetCode !== parseInt(code) || Date.now() > user.passwordResetCodeExpires) {
        return res.status(400).json({ msg: "Invalid or expired code." });
      }
  
      // Hash the new password and update the user's record
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
  
      // Clear the reset code and expiration
      user.passwordResetCode = null;
      user.passwordResetCodeExpires = null;
  
      await user.save();
  
      res.status(200).json({ msg: "Password reset successfully. Please Login" });
  
    } catch (error) {
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  }));
  
  


  



const createAccessToken = (user) =>{
  return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '7d'})
}
const createRefreshToken = (user) =>{
  return jwt.sign(user, process.env.REFRESH_TOKEN, {expiresIn: '7d'})
}



module.exports = UserAuth;
