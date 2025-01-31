const AdminUsersRoute = require("express").Router();
const User = require("../models/UserModel");
const Driver = require("../models/DriverModel");
const verifyMainAdmin = require("../adminmiddleware/verifyMainAdmin");
const mainAdmin = require("../adminmiddleware/mainAdmin");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

AdminUsersRoute.get(
  "/admin_show_all_users",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find().sort({ _id: -1 });

      res.json(users);
    } catch (error) {
      res.status(500).json({
        msg: `There was an error in getting the users: ${error.message}`,
      });
    }
  })
);

AdminUsersRoute.get(
  "/admin_show_user/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findOne({ _id: id });

      res.json(user);
    } catch (error) {
      res.status(500).json({
        msg: `There was an error in getting the users: ${error.message}`,
      });
    }
  })
);

AdminUsersRoute.put(
  "/admin_change_user_account/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      await User.findByIdAndUpdate(id, req.body, { new: true });

      res.json({ msg: "action has been successful" });
    } catch (error) {
      res.json({ msg: `problem in changing user account` });
    }
  })
);

AdminUsersRoute.get(
  "/admin_view_driver_application/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const driver = await Driver.findOne({ driverName: id });

    if (!driver) {
      return res.json({ msg: "USER HAS NO DRIVER APPLICATION" });
    }

    res.json(driver);
  })
);

AdminUsersRoute.put(
  "/admin_approve_driver_application/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const findApp = await Driver.findOne({ driverName: id });

      let appId = findApp._id;

      await Driver.findByIdAndUpdate(appId, req.body, { new: true });

      res.json({ msg: "Success!" });
    } catch (error) {
      res.json({ msg: `try again later` });
    }
  })
);

AdminUsersRoute.delete(
  "/admin_delete_application/:id",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      const email = user.email;

      const findApp = await Driver.findOne({ driverName: id });

      const userId = findApp._id;

      await Driver.findByIdAndDelete(userId);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Send verification code to user's email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Driver Application ",
        text: `Your application as driver for Kalichanngu transport services has been rejected`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ msg: "user will be emailed" });
    } catch (error) {
      res.json({ msg: `try again later` });
    }
  })
);

AdminUsersRoute.get(
  "/admin_all_drivers",
  verifyMainAdmin,
  mainAdmin,
  asyncHandler(async (req, res) => {
    try {
      const drivers = await User.find({ role: 11 });

      res.json(drivers);
    } catch (error) {
      res.json({ msg: "try again later" });
    }
  })
);



module.exports = AdminUsersRoute;
