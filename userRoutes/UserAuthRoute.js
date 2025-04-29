const UserAuth = require('express').Router();
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verify");
const TemporaryUser = require('../models/TemporarlyUserMod')
const crypto = require('crypto');
const nodemailer = require('nodemailer')




UserAuth.post("/user_register", asyncHandler(async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;

    if (!fullname) return res.status(400).json({ msg: "Your name cannot be empty" });
    if (!email) return res.status(400).json({ msg: "Your email cannot be empty" });
    if (!password) return res.status(400).json({ msg: "Password cannot be empty" });
    if (!phone) return res.status(400).json({ msg: "Phone number cannot be empty" });

  
    const emailExists = await User.findOne({ email }) || await TemporaryUser.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "The email exists, please use another" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const verificationToken = crypto.randomBytes(32).toString('hex');

  
    const tempUser = new TemporaryUser({
      fullname,
      email,
      password: hashedPassword,
      phone,
      verificationToken, 
    });

    await tempUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD  
      }
    });

    
    const verificationLink = `https://hikingapi.onrender.com/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Link',
      html: `
        <h1>Welcome to the App!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Your Email</a>
        <p>This link is valid for 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "A verification link has been sent to your email." });
  } catch (error) {
    console.error(`Error during registration: ${error.stack}`);
    res.status(500).json({ msg: `There was an error: ${error.message}` });
  }
}));



UserAuth.get("/verify", asyncHandler(async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).send('Missing verification parameters');
    }

  
    const tempUser = await TemporaryUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).send('Verification link expired or invalid.');
    }

    
    if (tempUser.verificationToken !== token) {
      return res.status(400).send('Invalid verification link.');
    }

    
    const newUser = new User({
      fullname: tempUser.fullname,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
    });

    await newUser.save();

  
    await TemporaryUser.deleteOne({ email });

  
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Verified</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .success { color: #28a745; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 20px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">Email Successfully Verified!</h1>
          <p>Your account has been verified. You can now go back to the app to login.</p>
          
          
        </div>
        
       
      </body>
      </html>
    `);
  } catch (error) {
    console.error(`Error during verification: ${error.stack}`);
    res.status(500).send(`There was an error: ${error.message}`);
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
        return res.status(400).json({ msg: "Email cannot be empty." });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ msg: "No user with this email address exists." });
      }
  
      
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; 
  
     
      user.passwordResetToken = resetToken;
      user.passwordResetTokenExpires = resetTokenExpires;
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
     
      const resetLink = `https://hikingapi.onrender.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Link',
        html: `
          <h1>Password Reset Request</h1>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Your Password</a>
          <p>This link is valid for 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ msg: "A password reset link has been sent to your email. Check Your Inbox or Spam." });
  
    } catch (error) {
      console.error(`Error during password reset request: ${error.stack}`);
      res.status(500).json({ msg: `There was a problem: ${error.message}` });
    }
  }));
  
    UserAuth.get('/reset-password', asyncHandler(async (req, res) => {
    try {
      const { token, email } = req.query;
  
      if (!token || !email) {
        return res.status(400).send('Missing reset password parameters');
      }
  
      
      const user = await User.findOne({ 
        email,
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).send('Password reset link expired or invalid.');
      }
  
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .form-group { margin-bottom: 20px; }
            .form-control { 
              width: 100%; 
              padding: 10px; 
              border: 1px solid #ddd; 
              border-radius: 4px; 
            }
            .btn-primary { 
              background-color: #007bff; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 4px; 
              cursor: pointer; 
              position: relative;
              min-width: 160px;
            }
            .btn-primary:disabled {
              background-color: #6c757d;
              cursor: not-allowed;
            }
            .error { color: #dc3545; margin-top: 10px; }
            
            /* Password field styles */
            .password-container {
              position: relative;
              width: 100%;
            }
            
            .password-toggle {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              border: none;
              background: transparent;
              cursor: pointer;
              color: #6c757d;
              font-size: 14px;
              padding: 5px;
            }
            
            /* Spinner styles */
            .spinner {
              display: none;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255,255,255,.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s ease-in-out infinite;
              position: absolute;
              top: calc(50% - 10px);
              left: calc(50% - 10px);
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            .btn-text {
              transition: opacity 0.2s;
            }
            
            .loading .spinner {
              display: inline-block;
            }
            
            .loading .btn-text {
              opacity: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>Please enter your new password below:</p>
            
            <form id="resetForm">
              <div class="form-group">
                <div class="password-container">
                  <input type="password" id="password" class="form-control" placeholder="New Password" required minlength="6">
                  <button type="button" class="password-toggle" id="toggle-password">Show</button>
                </div>
              </div>
              <div class="form-group">
                <div class="password-container">
                  <input type="password" id="confirm-password" class="form-control" placeholder="Confirm New Password" required minlength="6">
                  <button type="button" class="password-toggle" id="toggle-confirm-password">Show</button>
                </div>
              </div>
              <button type="submit" id="submitBtn" class="btn-primary">
                <span class="btn-text">Reset Password</span>
                <div class="spinner"></div>
              </button>
              <p id="error-message" class="error"></p>
            </form>
          </div>
          
          <script>
            // Toggle password visibility functions
            function setupPasswordToggle(passwordId, toggleId) {
              const passwordInput = document.getElementById(passwordId);
              const toggleButton = document.getElementById(toggleId);
              
              toggleButton.addEventListener('click', function() {
                if (passwordInput.type === 'password') {
                  passwordInput.type = 'text';
                  toggleButton.textContent = 'Hide';
                } else {
                  passwordInput.type = 'password';
                  toggleButton.textContent = 'Show';
                }
              });
            }
            
            // Setup both password fields
            setupPasswordToggle('password', 'toggle-password');
            setupPasswordToggle('confirm-password', 'toggle-confirm-password');
            
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirm-password').value;
              const errorElement = document.getElementById('error-message');
              const submitBtn = document.getElementById('submitBtn');
              
              // Check if passwords match
              if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                return;
              }
              
              // Show loading state
              submitBtn.classList.add('loading');
              submitBtn.disabled = true;
              errorElement.textContent = '';
              
              try {
                const response = await fetch('/complete-reset-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: '${email}',
                    token: '${token}',
                    newPassword: password
                  })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  // Replace form with success message
                  document.querySelector('.container').innerHTML = \`
                    <h1 style="color: #28a745;">Password Reset Successful!</h1>
                    <p>\${data.msg}</p>
                    <p>You can now return to the app and login with your new password.</p>
                  \`;
                } else {
                  errorElement.textContent = data.msg || 'An error occurred';
                  // Remove loading state if there's an error
                  submitBtn.classList.remove('loading');
                  submitBtn.disabled = false;
                }
              } catch (error) {
                errorElement.textContent = 'An error occurred. Please try again.';
                // Remove loading state if there's an error
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
              }
            });
          </script>
        </body>
        </html>
      `);


    } catch (error) {
      console.error(`Error serving reset form: ${error.stack}`);
      res.status(500).send(`There was an error: ${error.message}`);
    }
  }));
  
  
  UserAuth.post('/complete-reset-password', asyncHandler(async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
  
      if (!email || !token || !newPassword) {
        return res.status(400).json({ msg: "All fields are required." });
      }
  
     
      const user = await User.findOne({
        email,
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ msg: "Invalid or expired password reset link." });
      }
  
            const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      
      await user.save();
  
      res.status(200).json({ msg: "Password reset successfully. You can now login with your new password." });
  
    } catch (error) {
      console.error(`Error completing password reset: ${error.stack}`);
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
